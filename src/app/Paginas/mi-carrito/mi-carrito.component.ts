import { Component, OnInit } from '@angular/core';
import { Producto } from '../../Modelos/producto';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mi-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mi-carrito.component.html',
  styleUrls: ['./mi-carrito.component.css']
})
export class MiCarritoComponent implements OnInit {
  carrito: { producto: Producto; cantidad: number }[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    const usuario = localStorage.getItem('user');
    const username = usuario ? JSON.parse(usuario).username : null;

    if (username) {
      const datos = localStorage.getItem('carrito_' + username);
      this.carrito = datos ? JSON.parse(datos) : [];
    } else {
      this.carrito = [];
    }
  }

  eliminarDelCarrito(id: number) {
    const usuario = localStorage.getItem('user');
    const username = usuario ? JSON.parse(usuario).username : null;

    if (!username) return;

    this.carrito = this.carrito.filter(item => item.producto.id !== id);
    localStorage.setItem('carrito_' + username, JSON.stringify(this.carrito));
  }

  generarFactura() {
    localStorage.setItem('factura_temp', JSON.stringify(this.carrito));
    this.router.navigate(['/factura']);
  }
}