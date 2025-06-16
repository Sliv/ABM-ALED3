import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../servicios/producto.service';
import { Producto } from '../../Modelos/producto';
import { FacturaComponent } from '../../component/factura/factura.component';

@Component({
  selector: 'app-comprar-productos',
  standalone: true,
  imports: [CommonModule, FacturaComponent],
  templateUrl: './comprar-productos.component.html',
  styleUrls: ['./comprar-productos.component.css']
})
export class ComprarProductosComponent implements OnInit {
  productos: Producto[] = [];
  productosSeleccionados: { producto: Producto; cantidad: number }[] = [];
  mostrarFactura: boolean = false;

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.productos = this.productoService.obtenerProductos();
  }

  agregarProducto(prod: Producto) {
    const existente = this.productosSeleccionados.find(p => p.producto.id === prod.id);
    if (existente) {
      existente.cantidad++;
    } else {
      this.productosSeleccionados.push({ producto: prod, cantidad: 1 });
    }
  }

  confirmarCompra() {
    this.mostrarFactura = true;
  }

  cancelarCompra() {
    this.productosSeleccionados = [];
    this.mostrarFactura = false;
  }

  compraConfirmada() {
    alert('Compra confirmada');
    this.cancelarCompra();
  }
}