import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../servicios/producto.service';
import { Producto } from '../../Modelos/producto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit {
  producto!: Producto;
  cantidad: number = 1;

  constructor(private route: ActivatedRoute, private productoService: ProductoService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const productos = this.productoService.obtenerProductos();
    const encontrado = productos.find(p => p.id === id);
    if (encontrado) {
      this.producto = encontrado;
    }
  }

  private getCarritoKey(): string | null {
    const usuario = localStorage.getItem('user');
    if (!usuario) return null;
    const username = JSON.parse(usuario).username;
    return 'carrito_' + username;
  }

  agregarAlCarrito() {
    const key = this.getCarritoKey();

    if (!key) {
      alert('Debes iniciar sesión para agregar productos al carrito.');
      return;
    }

    const datos = localStorage.getItem(key);
    let carrito = datos ? JSON.parse(datos) : [];

    const index = carrito.findIndex((item: any) => item.producto.id === this.producto.id);
    if (index >= 0) {
      carrito[index].cantidad += this.cantidad;
    } else {
      carrito.push({ producto: this.producto, cantidad: this.cantidad });
    }

    localStorage.setItem(key, JSON.stringify(carrito));
    alert('Producto agregado al carrito');
  }

  comprarAhora() {
    const key = this.getCarritoKey();

    if (!key) {
      alert('Debes iniciar sesión para comprar productos.');
      return;
    }

    this.agregarAlCarrito();
    alert('Compra directa en proceso (simulada)');
  }
}
