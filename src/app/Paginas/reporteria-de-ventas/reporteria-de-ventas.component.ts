import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { auth, db } from '../../../environments/firebase.config';
import { collection, onSnapshot } from 'firebase/firestore';
import { Chart, registerables } from 'chart.js';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { BcraService } from '../../servicios/bcra.service';

Chart.register(...registerables);

interface ProductoVenta {
  cantidad: number;
  producto: {
    id: string;
    nombre: string;
    precio: number;
    categoria: string;
    descripcion: string;
    imagen: string;
  };
  total: number;
}

interface Compra {
  fecha: string;
  productos: ProductoVenta[];
  total: number;
  username: string;
  usuarioId: string;
}

interface MesOpcion {
  value: string;
  label: string;
}

@Component({
  selector: 'app-reporteria-de-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reporteria-de-ventas.component.html',
  styleUrls: ['./reporteria-de-ventas.component.css'],
})
export class ReporteriaDeVentasComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('ventasCanvas') ventasCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('dolarCanvas') dolarCanvas!: ElementRef<HTMLCanvasElement>;

  compras: Compra[] = [];
  esAdmin = false;
  chartVentas: Chart | null = null;
  chartDolar: Chart | null = null;

  agrupacion: 'semana' | 'mes' | 'anio' = 'semana';

  mesesDisponibles: MesOpcion[] = [];
  mesesSeleccionados: string[] = [];
  aniosDisponibles: number[] = [];
  anioSeleccionado = new Date().getFullYear();

  productosVendidos: { nombre: string; cantidad: number }[] = [];
  private comprasUnsubscribe: () => void = () => {};

  constructor(private bcraService: BcraService) {}

  ngOnInit() {}

ngAfterViewInit(): void {
  this.verificarAdmin(); 
}

ngOnDestroy(): void {
  if (this.comprasUnsubscribe) this.comprasUnsubscribe();
}

private async verificarAdmin() {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdTokenResult(true);
    this.esAdmin = !!token.claims['admin'];
  }

  if (this.esAdmin) {
    this.cargarComprasRealtime();

    setTimeout(() => {
      this.cargarEvolucionDolar();
    });
  }
}

  private cargarComprasRealtime() {
    const comprasRef = collection(db, 'Compras');
    this.comprasUnsubscribe = onSnapshot(
      comprasRef,
      (snapshot) => {
        this.compras = snapshot.docs.map((doc) => doc.data() as Compra);
        this.obtenerMesesDisponibles();
        this.obtenerAniosDisponibles();
        this.actualizarGrafico();
      },
      (error) => console.error('Error al escuchar compras:', error)
    );
  }

  exportarExcel() {
    if (!this.compras.length) return;

    const ventasData = this.compras.flatMap((c) =>
      c.productos.map((p) => ({
        Fecha: this.formatearFecha(c.fecha),
        Producto: p.producto.nombre,
        Cantidad: p.cantidad,
        Total: p.cantidad * p.producto.precio,
      }))
    );

    const wsVentas: XLSX.WorkSheet = XLSX.utils.json_to_sheet(ventasData);
    const wsProductos: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
      this.productosVendidos
    );

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsVentas, 'Ventas');
    XLSX.utils.book_append_sheet(wb, wsProductos, 'Top Productos');

    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });
    FileSaver.saveAs(blob, 'reporteria_completa.xlsx');
  }

  private formatearFecha(fecha: string): string {
    const d = new Date(fecha);
    return `${d.getDate().toString().padStart(2, '0')}/${(
      d.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${d.getFullYear()}`;
  }

  private obtenerMesesDisponibles() {
    const mesesSet = new Set<string>();
    const nombresMeses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    this.compras.forEach((c) => {
      const fecha = new Date(c.fecha);
      mesesSet.add(
        `${fecha.getFullYear()}-${(fecha.getMonth() + 1)
          .toString()
          .padStart(2, '0')}`
      );
    });

    this.mesesDisponibles = Array.from(mesesSet)
      .sort((a, b) => b.localeCompare(a))
      .map((m) => {
        const [anio, mes] = m.split('-');
        return {
          value: m,
          label: `${nombresMeses[parseInt(mes) - 1]} ${anio}`,
        };
      });

    if (this.mesesDisponibles.length && !this.mesesSeleccionados.length)
      this.mesesSeleccionados = [this.mesesDisponibles[0].value];
  }

  private obtenerAniosDisponibles() {
    const aniosSet = new Set<number>();
    this.compras.forEach((c) => aniosSet.add(new Date(c.fecha).getFullYear()));
    this.aniosDisponibles = Array.from(aniosSet).sort((a, b) => b - a);
  }

  actualizarGrafico() {
    this.generarGraficoVentas();
    this.generarTablaProductos();
  }

  generarGraficoVentas() {
    const ctx = this.ventasCanvas?.nativeElement?.getContext('2d');
    if (!ctx) return;

    const agrupadas = this.agruparCompras(this.compras, this.agrupacion);
    if (this.chartVentas) this.chartVentas.destroy();

    let labels = Object.keys(agrupadas);
    if (this.agrupacion === 'anio') {
      const nombresMeses = [
        'Ene',
        'Feb',
        'Mar',
        'Abr',
        'May',
        'Jun',
        'Jul',
        'Ago',
        'Sep',
        'Oct',
        'Nov',
        'Dic',
      ];
      labels = labels.map(
        (l) => nombresMeses[parseInt(l.split('-')[1], 10) - 1]
      );
    }

    this.chartVentas = new Chart(ctx, {
      type: this.agrupacion === 'anio' ? 'bar' : 'line',
      data: {
        labels,
        datasets: [
          {
            label: `Ventas por ${this.agrupacion}`,
            data: Object.values(agrupadas),
            backgroundColor: 'rgba(33, 192, 19, 0.6)',
            borderColor: 'rgba(0, 255, 13, 1)',
            borderWidth: 2,
            fill: this.agrupacion !== 'anio',
          },
        ],
      },
      options: { responsive: true, plugins: { legend: { display: false } } },
    });
  }

  generarTablaProductos() {
    const contador: { [nombre: string]: number } = {};
    this.compras.forEach((c) => {
      if (!c.productos) return;
      c.productos.forEach((p) => {
        const nombre = p.producto.nombre;
        const cantidad = p.cantidad || 1;
        contador[nombre] = (contador[nombre] || 0) + cantidad;
      });
    });
    this.productosVendidos = Object.keys(contador)
      .map((nombre) => ({ nombre, cantidad: contador[nombre] }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }

  private cargarEvolucionDolar() {
    this.bcraService.obtenerEvolucionUSD(30).subscribe({
      next: (data) => {
        console.log('Datos del BCRA recibidos:', data);

        if (!data || data.length === 0) {
          console.warn('No se recibieron datos del dólar.');
          return;
        }

        const labels = data.map(d => {
          const fecha = new Date(d.fecha);
          return `${fecha.getDate().toString().padStart(2,'0')}/${(fecha.getMonth()+1).toString().padStart(2,'0')}/${fecha.getFullYear()}`;
        });
        const valores = data.map((d) => d.valor);

        const ctx = this.dolarCanvas?.nativeElement?.getContext('2d');
        if (!ctx) {
          console.error('Canvas del dólar no encontrado.');
          return;
        }

        if (this.chartDolar) this.chartDolar.destroy();

        this.chartDolar = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Evolución del Dólar (BCRA)',
                data: valores,
                borderColor: 'rgba(0, 123, 255, 1)',
                backgroundColor: 'rgba(0, 123, 255, 0.3)',
                borderWidth: 2,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: false } },
          },
        });
      },
      error: (err) => {
        console.error('Error al obtener datos del dólar:', err);
      },
    });
  }

  private agruparCompras(compras: Compra[], tipo: 'semana' | 'mes' | 'anio') {
    const agrupadas: { [clave: string]: number } = {};
    const hoy = new Date();

    if (tipo === 'semana') {
      const { inicio, fin } = this.getSemanaActual();
      for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
        agrupadas[this.formatearFecha(d.toISOString())] = 0;
      }
      compras.forEach((c) => {
        const fecha = new Date(c.fecha);
        if (fecha >= inicio && fecha <= fin)
          agrupadas[this.formatearFecha(fecha.toISOString())] += c.total;
      });
    } else if (tipo === 'mes') {
      const [anioSel, mesSel] = (
        this.mesesSeleccionados[0] ||
        `${hoy.getFullYear()}-${(hoy.getMonth() + 1)
          .toString()
          .padStart(2, '0')}`
      ).split('-');
      const anio = parseInt(anioSel, 10);
      const mes = parseInt(mesSel, 10);
      const diasEnMes = new Date(anio, mes, 0).getDate();
      for (let d = 1; d <= diasEnMes; d++) {
        agrupadas[
          this.formatearFecha(
            `${anio}-${mes.toString().padStart(2, '0')}-${d
              .toString()
              .padStart(2, '0')}`
          )
        ] = 0;
      }
      compras.forEach((c) => {
        const fecha = new Date(c.fecha);
        if (fecha.getFullYear() === anio && fecha.getMonth() + 1 === mes)
          agrupadas[this.formatearFecha(c.fecha)] += c.total;
      });
    } else {
      const anio = this.anioSeleccionado;
      for (let m = 1; m <= 12; m++)
        agrupadas[`${anio}-${m.toString().padStart(2, '0')}`] = 0;
      compras.forEach((c) => {
        const fecha = new Date(c.fecha);
        if (fecha.getFullYear() === anio)
          agrupadas[
            `${anio}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`
          ] += c.total;
      });
    }

    return agrupadas;
  }

  private getSemanaActual(refDate: Date = new Date()): { inicio: Date; fin: Date } {
    const dia = refDate.getDay();
    const diffLunes = dia === 0 ? -6 : 1 - dia;
    const inicio = new Date(refDate);
    inicio.setDate(refDate.getDate() + diffLunes);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);
    fin.setHours(23, 59, 59, 999);
    return { inicio, fin };
  }
}