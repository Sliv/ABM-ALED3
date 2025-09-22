import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ProductoService } from '../../servicios/producto.service';
import { Producto } from '../../Modelos/producto';
import { CompraService } from '../../servicios/compra.service';
import { Compra } from '../../Modelos/compra.model';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit {
  producto?: Producto;
  cantidad: number = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoService: ProductoService,
    private compraService: CompraService
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/comprar-productos']);
      return;
    }

    try {
      // Convertimos el Observable en Promise
      const productos = await firstValueFrom(this.productoService.obtenerProductos());
      const prod = productos.find((p: Producto) => p.id === id);
      if (prod) {
        this.producto = prod;
      } else {
        this.router.navigate(['/comprar-productos']);
      }
    } catch (err) {
      console.error('Error al cargar productos:', err);
    }
  }

  agregarAlCarrito(): void {
    if (!this.producto || !this.producto.id) return;

    const usuario = localStorage.getItem('usuario');
    const username = usuario ? JSON.parse(usuario).username : null;

    if (!username) {
      alert('Debes iniciar sesión para agregar productos al carrito.');
      this.router.navigate(['/login']);
      return;
    }

    const carritoKey = 'carrito_' + username;
    const data = localStorage.getItem(carritoKey);
    const carritoActual: { producto: Producto; cantidad: number }[] =
      data && data !== 'undefined' ? JSON.parse(data) : [];

    const existente = carritoActual.find(p => p.producto.id === this.producto!.id);

    if (existente) {
      existente.cantidad += this.cantidad;
    } else {
      const prodSeguro = { ...this.producto, id: this.producto.id! };
      carritoActual.push({ producto: prodSeguro, cantidad: this.cantidad });
    }

    localStorage.setItem(carritoKey, JSON.stringify(carritoActual));
    alert('Producto agregado al carrito');
  }

  comprarAhora(): void {
    if (!this.producto || !this.producto.id) return;

    const usuario = localStorage.getItem('usuario');
    const username = usuario ? JSON.parse(usuario).username : null;

    if (!username) {
      alert('Debes iniciar sesión para realizar una compra.');
      this.router.navigate(['/login']);
      return;
    }

    const productoSeguro = { ...this.producto, id: this.producto.id! };

    const compra: Compra = {
      username,
      productos: [{ producto: productoSeguro, cantidad: this.cantidad }],
      fecha: new Date().toISOString()
    };

    this.compraService.agregarCompra(compra).subscribe({
      next: () => {
        const productosAComprar = [{ producto: productoSeguro, cantidad: this.cantidad }];
        localStorage.setItem('factura_temp', JSON.stringify(productosAComprar));
        this.router.navigate(['/factura']);
      },
      error: () => {
        alert('Error al guardar la compra');
      }
    });
  }
}