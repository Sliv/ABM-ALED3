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
    // ✅ Nos suscribimos al observable
    this.productoService.obtenerProductos().subscribe((productos: Producto[]) => {
      this.productos = productos;
    });
  }

  verProducto(id: number) {
    this.router.navigate(['/producto', id]);
  }
}
