import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ProductoService } from '../../servicios/producto.service';
import { Producto } from '../../Modelos/producto';
import { CompraService } from '../../servicios/compra.service';
import { Compra, CompraProducto } from '../../Modelos/compra.model';
import { Auth, User } from '@angular/fire/auth';

interface CarritoItem {
  producto: Producto & { id: string };
  cantidad: number;
}

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit {
  producto?: Producto & { id: string };
  cantidad: number = 1;

  private productoService = inject(ProductoService);
  private compraService = inject(CompraService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private auth = inject(Auth);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/comprar-productos']);
      return;
    }

    try {
      const productos = await firstValueFrom(this.productoService.obtenerProductos());
      const prod = productos.find(p => p.id === id);
      if (!prod || !prod.id) {
        this.router.navigate(['/comprar-productos']);
        return;
      }
      this.producto = { ...prod, id: prod.id! };
    } catch (err) {
      console.error('Error al cargar productos:', err);
      alert('No se pudieron cargar los productos. Intente más tarde.');
      this.router.navigate(['/comprar-productos']);
    }
  }

  agregarAlCarrito(): void {
    if (!this.producto) return;

    const currentUser: User | null = this.auth.currentUser;
    if (!currentUser) {
      alert('Debes iniciar sesión para agregar productos al carrito.');
      this.router.navigate(['/login']);
      return;
    }

    const username = currentUser.email || currentUser.displayName || 'Invitado';
    const carritoKey = 'carrito_' + username;
    let carritoActual: CarritoItem[] = [];
    try {
      const data = localStorage.getItem(carritoKey);
      carritoActual = data ? JSON.parse(data) : [];
    } catch {
      carritoActual = [];
    }

    const existente = carritoActual.find(item => item.producto.id === this.producto!.id);
    if (existente) {
      existente.cantidad += this.cantidad;
    } else {
      carritoActual.push({ producto: { ...this.producto }, cantidad: this.cantidad });
    }

    localStorage.setItem(carritoKey, JSON.stringify(carritoActual));
    alert('Producto agregado al carrito');
  }

  comprarAhora(): void {
    if (!this.producto) return;

    const currentUser: User | null = this.auth.currentUser;
    if (!currentUser) {
      alert('Debes iniciar sesión para realizar una compra.');
      this.router.navigate(['/login']);
      return;
    }

    const username = currentUser.email || currentUser.displayName || 'Invitado';

    const productosCompra: CompraProducto[] = [{
      producto: {
        id: this.producto.id!,
        nombre: this.producto.nombre,
        precio: this.producto.precio,
        descripcion: this.producto.descripcion,
        categoria: this.producto.categoria || '',
        imagen: this.producto.imagen || ''
      },
      cantidad: this.cantidad,
      total: this.producto.precio * this.cantidad
    }];

    const compra: Compra = {
      usuarioId: currentUser.uid,
      username,
      productos: productosCompra,
      fecha: new Date().toISOString(),
      total: productosCompra.reduce((sum, item) => sum + item.total, 0)
    };

    this.compraService.agregarCompra(compra).subscribe({
      next: () => {
        localStorage.setItem('factura_temp', JSON.stringify(productosCompra));
        this.router.navigate(['/factura']);
      },
      error: (err) => {
        console.error('Error al guardar la compra:', err);
        alert('Error al guardar la compra');
      }
    });
  }
}