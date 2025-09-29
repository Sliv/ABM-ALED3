import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { auth, db } from '../../../environments/firebase.config'; 
import { collection, onSnapshot } from 'firebase/firestore';
import { Chart, registerables } from 'chart.js';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

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
  styleUrls: ['./reporteria-de-ventas.component.css']
})
export class ReporteriaDeVentasComponent implements OnInit, OnDestroy {
  compras: Compra[] = [];
  esAdmin: boolean = false;
  chartVentas: Chart | null = null;

  agrupacion: 'semana' | 'mes' | 'anio' = 'semana';

  mesesDisponibles: MesOpcion[] = [];
  mesesSeleccionados: string[] = [];

  aniosDisponibles: number[] = [];
  anioSeleccionado: number = new Date().getFullYear();

  productosVendidos: { nombre: string; cantidad: number }[] = [];

  private comprasUnsubscribe: () => void = () => {};

  ngOnInit() {
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
    }
  }

  private cargarComprasRealtime() {
    const comprasRef = collection(db, 'Compras');
    this.comprasUnsubscribe = onSnapshot(comprasRef, (snapshot) => {
      this.compras = snapshot.docs.map(doc => doc.data() as Compra);
      this.obtenerMesesDisponibles();
      this.obtenerAniosDisponibles();
      this.actualizarGrafico();
    }, (error) => {
      console.error('Error al escuchar compras en tiempo real:', error);
    });
  }

    exportarExcel() {
    if (!this.compras.length) return;

      const ventasData = this.compras.flatMap(c =>
      c.productos.map(p => ({
          Fecha: this.formatearFecha(c.fecha),
          Producto: p.producto.nombre,
          Cantidad: p.cantidad,
          Total: p.cantidad * p.producto.precio
        }))
    );

    const wsVentas: XLSX.WorkSheet = XLSX.utils.json_to_sheet(ventasData);
    const wsProductos: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.productosVendidos);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsVentas, 'Ventas');
    XLSX.utils.book_append_sheet(wb, wsProductos, 'Top Productos');

    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, 'reporteria_completa.xlsx');
  }

  private formatearFecha(fecha: string): string {
    const d = new Date(fecha);
    const dia = d.getDate().toString().padStart(2, '0');
    const mes = (d.getMonth() + 1).toString().padStart(2, '0');
    const anio = d.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  private obtenerMesesDisponibles() {
    const mesesSet = new Set<string>();
    const nombresMeses = [
      'Enero','Febrero','Marzo','Abril','Mayo','Junio',
      'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
    ];

    this.compras.forEach(c => {
      const fecha = new Date(c.fecha);
      mesesSet.add(`${fecha.getFullYear()}-${(fecha.getMonth()+1).toString().padStart(2,'0')}`);
    });

    const hoy = new Date();
    const mesActual = (hoy.getMonth() + 1).toString().padStart(2,'0');
    const anioActual = hoy.getFullYear();

    this.mesesDisponibles = Array.from(mesesSet)
      .sort((a, b) => b.localeCompare(a))
      .map(m => {
        const [anio, mes] = m.split('-');
        return {
          value: m,
          label: `${nombresMeses[parseInt(mes)-1]} ${anio}` +
                 (anio === anioActual.toString() && mes === mesActual ? ' (Actual)' : '')
        };
      });

    if (this.mesesDisponibles.length && !this.mesesSeleccionados.length) {
      this.mesesSeleccionados = [this.mesesDisponibles[0].value];
    }
  }

  private obtenerAniosDisponibles() {
    const aniosSet = new Set<number>();
    this.compras.forEach(c => aniosSet.add(new Date(c.fecha).getFullYear()));
    this.aniosDisponibles = Array.from(aniosSet).sort((a, b) => b - a);
  }

  private agruparCompras(compras: Compra[], tipo: 'semana' | 'mes' | 'anio') {
    const agrupadas: { [clave: string]: number } = {};
    const hoy = new Date();

    if (tipo === 'semana') {
      const { inicio, fin } = this.getSemanaActual();
      for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
        agrupadas[this.formatearFecha(d.toISOString())] = 0;
      }

      compras.forEach(c => {
        const fecha = new Date(c.fecha);
        const { inicio, fin } = this.getSemanaActual();
        if (fecha >= inicio && fecha <= fin) {
          agrupadas[this.formatearFecha(fecha.toISOString())] += c.total;
        }
      });
    } else if (tipo === 'mes') {
      const [anioSel, mesSel] = (this.mesesSeleccionados[0] || 
        `${hoy.getFullYear()}-${(hoy.getMonth()+1).toString().padStart(2,'0')}`).split('-');
      const anio = parseInt(anioSel, 10);
      const mes = parseInt(mesSel, 10);
      const diasEnMes = new Date(anio, mes, 0).getDate();

      for (let d = 1; d <= diasEnMes; d++) {
        agrupadas[this.formatearFecha(`${anio}-${mes.toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}`)] = 0;
      }

      compras.forEach(c => {
        const fecha = new Date(c.fecha);
        if (fecha.getFullYear() === anio && (fecha.getMonth()+1) === mes) {
          agrupadas[this.formatearFecha(c.fecha)] += c.total;
        }
      });
    } else if (tipo === 'anio') {
      const anio = this.anioSeleccionado;
      for (let m = 1; m <= 12; m++) {
        agrupadas[`${anio}-${m.toString().padStart(2,'0')}`] = 0;
      }

      compras.forEach(c => {
        const fecha = new Date(c.fecha);
        if (fecha.getFullYear() === anio) {
          agrupadas[`${anio}-${(fecha.getMonth()+1).toString().padStart(2,'0')}`] += c.total;
        }
      });
    }

    return agrupadas;
  }

  private getSemanaActual(refDate: Date = new Date()): { inicio: Date, fin: Date } {
    const dia = refDate.getDay();
    const diffLunes = dia === 0 ? -6 : 1 - dia;
    const inicio = new Date(refDate);
    inicio.setDate(refDate.getDate() + diffLunes);
    inicio.setHours(0,0,0,0);

    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);
    fin.setHours(23,59,59,999);

    return { inicio, fin };
  }

  actualizarGrafico() {
    this.generarGraficoVentas();
    this.generarTablaProductos();
  }

  generarGraficoVentas() {
    const agrupadas = this.agruparCompras(this.compras, this.agrupacion);
    if (this.chartVentas) this.chartVentas.destroy();

    let labels = Object.keys(agrupadas);
    if (this.agrupacion === 'mes') labels = labels.map(l => l.split('/')[0]);
    if (this.agrupacion === 'anio') {
      const nombresMeses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                            'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
      labels = labels.map(l => nombresMeses[parseInt(l.split('-')[1], 10) - 1]);
    }

    this.chartVentas = new Chart('ventasChart', {
      type: this.agrupacion === 'anio' ? 'bar' : 'line',
      data: {
        labels,
        datasets: [{
          label: `Ventas por ${this.agrupacion}`,
          data: Object.values(agrupadas),
          backgroundColor: 'rgba(33, 192, 19, 0.6)',
          borderColor: 'rgba(0, 255, 13, 1)',
          borderWidth: 2,
          fill: this.agrupacion !== 'anio'
        }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });
  }

  generarTablaProductos() {
    const contador: { [nombre: string]: number } = {};
    this.compras.forEach(c => {
      if (!c.productos) return;
      c.productos.forEach(p => {
        const nombre = p.producto.nombre;
        const cantidad = p.cantidad || 1;
        contador[nombre] = (contador[nombre] || 0) + cantidad;
      });
    });

    this.productosVendidos = Object.keys(contador).map(nombre => ({
      nombre,
      cantidad: contador[nombre]
    })).sort((a, b) => b.cantidad - a.cantidad);
  }
}