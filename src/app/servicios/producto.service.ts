import { Injectable } from '@angular/core';
import { Producto } from '../Modelos/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private key = 'productos';

  private productosIniciales: Producto[] = [
    { id: 1, nombre: 'Notebook', descripcion: 'Notebook HP 14"', precioARS: 450000, categoria: 'Tecnología', imagen: 'assets/notebook.jpg' },
    { id: 2, nombre: 'Zapatillas', descripcion: 'Zapatillas deportivas', precioARS: 80000, categoria: 'Indumentaria', imagen: 'assets/zapatillas.jpg' },
    { id: 3, nombre: 'Silla Gamer', descripcion: 'Ergonómica con apoyabrazos', precioARS: 150000, categoria: 'Hogar', imagen: 'assets/silla.jpg' }
  ];

  constructor() {
    if (!localStorage.getItem(this.key)) {
      this.guardarProductos(this.productosIniciales);
    }
  }

  obtenerProductos(): Producto[] {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : [];
  }

  guardarProductos(productos: Producto[]): void {
    localStorage.setItem(this.key, JSON.stringify(productos));
  }

  agregarProducto(producto: Producto): void {
    const lista = this.obtenerProductos();
    const nuevoId = lista.length > 0 ? Math.max(...lista.map(p => p.id)) + 1 : 1;
    producto.id = nuevoId;
    lista.push(producto);
    this.guardarProductos(lista);
  }

  actualizarProducto(producto: Producto): void {
    const lista = this.obtenerProductos().map(p => p.id === producto.id ? producto : p);
    this.guardarProductos(lista);
  }

  eliminarProducto(id: number): void {
    const lista = this.obtenerProductos().filter(p => p.id !== id);
    this.guardarProductos(lista);
  }
}