import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../servicios/producto.service';
import { Producto } from '../../Modelos/producto';
import { FiltroProductoPipe } from '../../pipes/filtro-producto.pipe';

@Component({
  selector: 'app-comprar-productos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FiltroProductoPipe
  ],
  templateUrl: './comprar-productos.component.html',
  styleUrls: ['./comprar-productos.component.css']
})
export class ComprarProductosComponent implements OnInit {
  productos: Producto[] = [];
  filtro: string = '';

  constructor(
    private productoService: ProductoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productoService.obtenerProductos().subscribe({
      next: (data: Producto[]) => {
        this.productos = data;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
      }
    });
  }

  verProducto(id?: string) {
    if (!id) return; 
    this.router.navigate(['/producto', id]);
  }
}