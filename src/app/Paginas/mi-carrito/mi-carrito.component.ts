import { Component, OnInit } from '@angular/core';
import { Producto } from '../../Modelos/producto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CompraService } from '../../servicios/compra.service';
import { Compra } from '../../Modelos/compra.model';

@Component({
  selector: 'app-mi-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mi-carrito.component.html',
  styleUrls: ['./mi-carrito.component.css']
})
export class MiCarritoComponent implements OnInit {
  carrito: { producto: Producto; cantidad: number; seleccionado?: boolean }[] = [];

  constructor(
    private router: Router,
    private compraService: CompraService
  ) {}

  ngOnInit(): void {
    const usuario = localStorage.getItem('usuario'); 
    const username = usuario ? JSON.parse(usuario).username : null;

    if (username) {
      const datos = localStorage.getItem('carrito_' + username);
      this.carrito = datos ? JSON.parse(datos) : [];
      this.carrito.forEach(item => item.seleccionado = item.seleccionado ?? false);
    }
  }

  eliminarDelCarrito(id?: string) {
    if (!id) return;

    const usuario = localStorage.getItem('usuario'); 
    const username = usuario ? JSON.parse(usuario).username : null;
    if (!username) return;

    this.carrito = this.carrito.filter(item => item.producto.id !== id);
    this.guardarCarrito(username);
  }

  eliminarSeleccionados() {
    const usuario = localStorage.getItem('usuario'); 
    const username = usuario ? JSON.parse(usuario).username : null;
    if (!username) return;

    this.carrito = this.carrito.filter(item => !item.seleccionado);
    this.guardarCarrito(username);
  }

  guardarCarrito(username: string) {
    localStorage.setItem('carrito_' + username, JSON.stringify(this.carrito));
  }

  generarFactura() {
    const usuario = localStorage.getItem('usuario');
    const username = usuario ? JSON.parse(usuario).username : null;
    if (!username) {
      alert('Debes iniciar sesión para generar una factura.');
      this.router.navigate(['/login']);
      return;
    }

    const productosCompra = this.carrito
      .filter(item => item.producto.id) 
      .map(item => ({
        producto: {
          id: item.producto.id!,
          nombre: item.producto.nombre,
          precio: item.producto.precio
        },
        cantidad: item.cantidad
      }));

    const compra: Compra = {
      username,
      productos: productosCompra,
      fecha: new Date().toISOString()
    };

    this.compraService.agregarCompra(compra).subscribe({
      next: () => {
        localStorage.setItem('factura_temp', JSON.stringify(productosCompra));
        this.carrito = [];
        this.guardarCarrito(username);
        this.router.navigate(['/factura']);
      },
      error: () => {
        alert('Error al generar la compra');
      }
    });
  }

  calcularTotal(): number {
    return this.carrito.reduce(
      (total, item) => total + (item.producto.precio || 0) * item.cantidad,
      0
    );
  }
}