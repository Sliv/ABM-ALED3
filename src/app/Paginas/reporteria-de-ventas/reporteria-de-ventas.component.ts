import { Component, OnInit } from '@angular/core';
import { auth, db } from '../../../environments/firebase.config'; 
import { collection, getDocs } from 'firebase/firestore';
import { Chart, registerables } from 'chart.js';


Chart.register(...registerables);

interface Compra {
  fecha: string;
  producto: { id: string; nombre: string; precio: number }[];
  total: number;
  username: string;
  usuarioId: string;
}

@Component({
  selector: 'app-reporteria-de-ventas',
  templateUrl: './reporteria-de-ventas.component.html',
  styleUrls: ['./reporteria-de-ventas.component.css']
})
export class ReporteriaDeVentasComponent implements OnInit {
  compras: Compra[] = [];
  esAdmin: boolean = false;

  constructor() {}

  async ngOnInit() {
    await this.verificarAdmin();
    if (!this.esAdmin) return;

    await this.cargarCompras();
    this.generarGraficoVentas();
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

  generarGraficoVentas() {
    const fechas = this.compras.map(c => c.fecha);
    const totales = this.compras.map(c => c.total);

    new Chart('ventasChart', {
      type: 'bar',
      data: {
        labels: fechas,
        datasets: [{
          label: 'Ventas',
          data: totales,
          backgroundColor: 'rgba(54, 162, 235, 0.6)'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    });
  }

}