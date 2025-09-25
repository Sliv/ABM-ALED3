import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { auth, db } from '../../../environments/firebase.config'; 
import { collection, getDocs } from 'firebase/firestore';
import { Chart, registerables } from 'chart.js';
import * as FileSaver from 'file-saver';

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
export class ReporteriaDeVentasComponent implements OnInit {
  compras: Compra[] = [];
  esAdmin: boolean = false;
  chartVentas: Chart | null = null;

  agrupacion: 'semana' | 'mes' | 'anio' = 'semana';

  mesesDisponibles: MesOpcion[] = [];
  mesesSeleccionados: string[] = [];

  aniosDisponibles: number[] = [];
  anioSeleccionado: number = new Date().getFullYear();

  productosVendidos: { nombre: string; cantidad: number }[] = [];

  constructor() {}

  async ngOnInit() {
    await this.verificarAdmin();
    if (!this.esAdmin) return;

    await this.cargarCompras();
    this.obtenerMesesDisponibles();
    this.obtenerAniosDisponibles();

    if (this.mesesDisponibles.length) {
      this.mesesSeleccionados = [this.mesesDisponibles[0].value];
    }

    this.actualizarGrafico();
  }

  async verificarAdmin() {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdTokenResult(true);
      this.esAdmin = token.claims['admin'] ? true : false;
    }
  }

  async cargarCompras() {
    const querySnapshot = await getDocs(collection(db, 'Compras'));
    this.compras = querySnapshot.docs.map(doc => doc.data() as Compra);
  }

  exportarCSV() {
    if (!this.compras.length) return;

    const header = ['Fecha', 'Cliente', 'Productos', 'Total'];
    const rows = this.compras.map(c => [
      c.fecha,
      c.username,
      c.productos.map(p => p.producto.nombre + ` (x${p.cantidad})`).join('; '),
      c.total
    ]);

    const csvContent =
      [header.join(','), ...rows.map(r => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(blob, 'reporteria_ventas.csv');
  }

  private obtenerMesesDisponibles() {
    const mesesSet = new Set<string>();
    const nombresMeses = [
      'Enero','Febrero','Marzo','Abril','Mayo','Junio',
      'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
    ];

    this.compras.forEach(c => {
      const fecha = new Date(c.fecha);
      const anio = fecha.getFullYear();
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      mesesSet.add(`${anio}-${mes}`);
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
  }

  private obtenerAniosDisponibles() {
    const aniosSet = new Set<number>();
    this.compras.forEach(c => {
      aniosSet.add(new Date(c.fecha).getFullYear());
    });
    this.aniosDisponibles = Array.from(aniosSet).sort((a, b) => b - a);
  }

  private agruparCompras(compras: Compra[], tipo: 'semana' | 'mes' | 'anio') {
    const agrupadas: { [clave: string]: number } = {};
    const hoy = new Date();

    if (tipo === 'semana') {
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1);
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6);

      for (let d = new Date(inicioSemana); d <= finSemana; d.setDate(d.getDate() + 1)) {
        const clave = d.toISOString().split('T')[0];
        agrupadas[clave] = 0;
      }

      compras.forEach(c => {
        const fecha = new Date(c.fecha);
        if (fecha >= inicioSemana && fecha <= finSemana) {
          const clave = fecha.toISOString().split('T')[0];
          agrupadas[clave] += c.total;
        }
      });
    }

    else if (tipo === 'mes') {
      const [anioSel, mesSel] = (this.mesesSeleccionados[0] || 
        `${hoy.getFullYear()}-${(hoy.getMonth() + 1).toString().padStart(2,'0')}`).split('-');
      const anio = parseInt(anioSel);
      const mes = parseInt(mesSel);

      const diasEnMes = new Date(anio, mes, 0).getDate();

      for (let d = 1; d <= diasEnMes; d++) {
        const clave = `${anio}-${mes.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
        agrupadas[clave] = 0;
      }

      compras.forEach(c => {
        const fecha = new Date(c.fecha);
        if (fecha.getFullYear() === anio && (fecha.getMonth() + 1) === mes) {
          const clave = fecha.toISOString().split('T')[0];
          agrupadas[clave] += c.total;
        }
      });
    }

    else if (tipo === 'anio') {
      const anio = this.anioSeleccionado;
      for (let m = 1; m <= 12; m++) {
        const clave = `${anio}-${m.toString().padStart(2, '0')}`;
        agrupadas[clave] = 0;
      }

      compras.forEach(c => {
        const fecha = new Date(c.fecha);
        if (fecha.getFullYear() === anio) {
          const clave = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2,'0')}`;
          agrupadas[clave] += c.total;
        }
      });
    }

    return agrupadas;
  }

  actualizarGrafico() {
    this.generarGraficoVentas();
    this.generarTablaProductos();
  }

  generarGraficoVentas() {
    const agrupadas = this.agruparCompras(this.compras, this.agrupacion);

    if (this.chartVentas) {
      this.chartVentas.destroy();
    }

    let labels = Object.keys(agrupadas);

    if (this.agrupacion === 'mes') {
      labels = labels.map(l => {
        const fecha = new Date(l);
        return fecha.getDate().toString(); 
      });
    }

    this.chartVentas = new Chart('ventasChart', {
      type: this.agrupacion === 'anio' ? 'bar' : 'line',
      data: {
        labels: labels,
        datasets: [{
          label: `Ventas por ${this.agrupacion}`,
          data: Object.values(agrupadas),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
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