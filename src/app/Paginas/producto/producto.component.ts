import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productoService.obtenerProductos().subscribe(productos => {
      const prod = productos.find(p => p.id === id);
      if (prod) {
        this.producto = prod;
      } else {
        this.router.navigate(['/comprar-productos']);
      }
    });
  }

  agregarAlCarrito(): void {
    if (!this.producto) return;

    const usuario = localStorage.getItem('usuario');
    const username = usuario ? JSON.parse(usuario).username : null;

    if (!username) {
      alert('Debes iniciar sesión para agregar productos al carrito.');
      this.router.navigate(['/login']);
      return;
    }

    const carritoKey = 'carrito_' + username;
    const data = localStorage.getItem(carritoKey);
    const carritoActual = data && data !== 'undefined' ? JSON.parse(data) : [];

    const existente = carritoActual.find((p: any) => p.producto?.id === this.producto!.id);

    if (existente) {
      existente.cantidad += this.cantidad;
    } else {
      carritoActual.push({ producto: this.producto, cantidad: this.cantidad });
    }

    localStorage.setItem(carritoKey, JSON.stringify(carritoActual));
    alert('Producto agregado al carrito');
  }

  comprarAhora(): void {
    if (!this.producto) return;

    const usuario = localStorage.getItem('usuario');
    const username = usuario ? JSON.parse(usuario).username : null;

    if (!username) {
      alert('Debes iniciar sesión para realizar una compra.');
      this.router.navigate(['/login']);
      return;
    }

    const compra: Compra = {
      username,
      productos: [
        { producto: this.producto, cantidad: this.cantidad }
      ],
      fecha: new Date().toISOString()
    };

    this.compraService.agregarCompra(compra).subscribe({
      next: () => {
        const productosAComprar = [
          { producto: this.producto, cantidad: this.cantidad }
        ];
        localStorage.setItem('factura_temp', JSON.stringify(productosAComprar));
        this.router.navigate(['/factura']);
      },
      error: () => {
        alert('Error al guardar la compra');
      }
    });
  }
}
