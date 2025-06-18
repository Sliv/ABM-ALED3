import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductoService } from '../../servicios/producto.service';
import { Producto } from '../../Modelos/producto';
import { CommonModule } from '@angular/common'; 
import { FiltroProductoPipe } from '../../pipes/filtro-producto.pipe'; 
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-producto',
  standalone: true, 
  templateUrl: './listar-producto.component.html',
  styleUrls: ['./listar-producto.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FiltroProductoPipe,
    FormsModule
  ]
})
export class ListarProductoComponent implements OnInit {
  productoForm!: FormGroup;
  productos: Producto[] = [];
  modoEdicion: boolean = false;
  productoEnEdicion: Producto | null = null;
  filtroTexto: string = '';

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.productos = this.productoService.obtenerProductos();
  }

  inicializarFormulario() {
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      precioARS: ['', [Validators.required, Validators.min(1)]],
      categoria: ['', Validators.required],
      imagen: ['', Validators.required]
    });
  }

  guardarProducto() {
    if (this.productoForm.invalid) return;

    if (this.modoEdicion && this.productoEnEdicion) {
      const productoActualizado: Producto = {
        ...this.productoEnEdicion,
        ...this.productoForm.value
      };
      this.productoService.actualizarProducto(productoActualizado);
      this.modoEdicion = false;
      this.productoEnEdicion = null;
    } else {
      this.productoService.agregarProducto(this.productoForm.value);
    }

    this.productos = this.productoService.obtenerProductos();
    this.productoForm.reset();
  }

  editarProducto(prod: Producto) {
    this.productoForm.patchValue(prod);
    this.productoEnEdicion = prod;
    this.modoEdicion = true;
  }

  eliminarProducto(id: number) {
    this.productoService.eliminarProducto(id);
    this.productos = this.productoService.obtenerProductos();
  }
}