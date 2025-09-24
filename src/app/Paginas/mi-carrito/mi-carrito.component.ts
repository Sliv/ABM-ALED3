import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CompraService } from '../../servicios/compra.service';
import { Compra, CompraProducto } from '../../Modelos/compra.model';
import { Producto } from '../../Modelos/producto';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';

@Component({
  selector: 'app-mi-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mi-carrito.component.html',
  styleUrls: ['./mi-carrito.component.css']
})
export class MiCarritoComponent implements OnInit {
  carrito: { producto: Producto; cantidad: number; seleccionado?: boolean }[] = [];
  private auth = inject(Auth);
  private usuario?: User;

  constructor(
    private router: Router,
    private compraService: CompraService
  ) {}

  ngOnInit(): void {
    onAuthStateChanged(this.auth, (usuario) => {
      this.usuario = usuario || undefined;
      this.cargarCarrito();
    });
  }

  cargarCarrito() {
    const username = this.usuario?.email || 'Invitado';
    const datos = localStorage.getItem('carrito_' + username);
    this.carrito = datos ? JSON.parse(datos) : [];
    this.carrito.forEach(item => item.seleccionado = item.seleccionado ?? false);
  }

  eliminarDelCarrito(id?: string) {
    if (!id || !this.usuario) return;
    const username = this.usuario.email || 'Invitado';
    this.carrito = this.carrito.filter(item => item.producto.id !== id);
    this.guardarCarrito(username);
  }

  eliminarSeleccionados() {
    if (!this.usuario) return;
    const username = this.usuario.email || 'Invitado';
    this.carrito = this.carrito.filter(item => !item.seleccionado);
    this.guardarCarrito(username);
  }

  guardarCarrito(username: string) {
    localStorage.setItem('carrito_' + username, JSON.stringify(this.carrito));
  }

  async generarFactura() {
    if (!this.usuario) {
      alert('Debes iniciar sesión para generar una factura.');
      this.router.navigate(['/login']);
      return;
    }

    const usuarioId = this.usuario.uid;
    const username = this.usuario.email || this.usuario.displayName || 'Invitado';

    const productosCompra: CompraProducto[] = this.carrito.map(item => ({
      producto: {
        id: item.producto.id!,
        nombre: item.producto.nombre,
        precio: item.producto.precio,
        descripcion: item.producto.descripcion,
        categoria: item.producto.categoria || '',
        imagen: item.producto.imagen || ''
      },
      cantidad: item.cantidad,
      total: item.producto.precio * item.cantidad
    }));

    const compra: Compra = {
      usuarioId,
      username,
      productos: productosCompra,
      fecha: new Date().toISOString(),
      total: productosCompra.reduce((sum, item) => sum + item.total, 0)
    };

    this.compraService.agregarCompra(compra).subscribe({
      next: () => {
        localStorage.setItem('factura_temp', JSON.stringify(productosCompra));
        this.carrito = [];
        this.guardarCarrito(username);
        this.router.navigate(['/factura']);
      },
      error: (err) => {
        console.error('Error al generar la compra:', err);
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