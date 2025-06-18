import { Component, OnInit } from '@angular/core';
import { Producto } from '../../Modelos/producto';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CompraService } from '../../servicios/compra.service';
import { Compra } from '../../Modelos/compra.model';

@Component({
  selector: 'app-mi-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mi-carrito.component.html',
  styleUrls: ['./mi-carrito.component.css']
})
export class MiCarritoComponent implements OnInit {
  carrito: { producto: Producto; cantidad: number }[] = [];

  constructor(
    private router: Router,
    private compraService: CompraService
  ) {}

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
    const usuario = localStorage.getItem('user');
    const username = usuario ? JSON.parse(usuario).username : null;

    if (!username) {
      alert('Debes iniciar sesión para generar una factura.');
      this.router.navigate(['/login']);
      return;
    }

    // Guardar la compra en el backend
    const compra: Compra = {
      username,
      productos: this.carrito,
      fecha: new Date().toISOString()
    };

    this.compraService.agregarCompra(compra).subscribe({
      next: () => {
        localStorage.setItem('factura_temp', JSON.stringify(this.carrito));
        this.router.navigate(['/factura']);
      },
      error: () => {
        alert('Error al generar la compra');
      }
    });
  }
}
