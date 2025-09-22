import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ProductoService } from '../../servicios/producto.service';
import { Producto } from '../../Modelos/producto';
import { CompraService } from '../../servicios/compra.service';
import { Compra } from '../../Modelos/compra.model';

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

    const usuario = localStorage.getItem('usuario');
    const username = usuario ? JSON.parse(usuario)?.username : null;
    if (!username) {
      alert('Debes iniciar sesión para agregar productos al carrito.');
      this.router.navigate(['/login']);
      return;
    }

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

    const usuario = localStorage.getItem('usuario');
    const username = usuario ? JSON.parse(usuario)?.username : null;
    if (!username) {
      alert('Debes iniciar sesión para realizar una compra.');
      this.router.navigate(['/login']);
      return;
    }

    const compra: Compra = {
      username,
      productos: [{ producto: { ...this.producto }, cantidad: this.cantidad }],
      fecha: new Date().toISOString()
    };

    this.compraService.agregarCompra(compra).subscribe({
      next: () => {
        localStorage.setItem(
          'factura_temp',
          JSON.stringify([{ producto: { ...this.producto }, cantidad: this.cantidad }])
        );
        this.router.navigate(['/factura']);
      },
      error: () => {
        alert('Error al guardar la compra');
      }
    });
  }
}