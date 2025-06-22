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
    this.cargarProductos();
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

  cargarProductos() {
    this.productoService.obtenerProductos().subscribe({
      next: (productos) => this.productos = productos,
      error: (err) => console.error('Error al obtener productos:', err)
    });
  }

  guardarProducto() {
    if (this.productoForm.invalid) return;

    if (this.modoEdicion && this.productoEnEdicion) {
      const productoActualizado: Producto = {
        ...this.productoEnEdicion,
        ...this.productoForm.value
      };
      this.productoService.actualizarProducto(productoActualizado).subscribe({
        next: () => {
          this.modoEdicion = false;
          this.productoEnEdicion = null;
          this.cargarProductos();
        },
        error: (err) => console.error('Error al actualizar producto:', err)
      });
    } else {
      this.productoService.agregarProducto(this.productoForm.value).subscribe({
        next: () => this.cargarProductos(),
        error: (err) => console.error('Error al agregar producto:', err)
      });
    }

    this.productoForm.reset();
  }

  editarProducto(prod: Producto) {
    this.productoForm.patchValue(prod);
    this.productoEnEdicion = prod;
    this.modoEdicion = true;
  }

  eliminarProducto(id: number) {
    this.productoService.eliminarProducto(id).subscribe({
      next: () => this.cargarProductos(),
      error: (err) => console.error('Error al eliminar producto:', err)
    });
  }

  cargarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const imageUrl = URL.createObjectURL(file);
      this.productoForm.patchValue({ imagen: imageUrl });
    }
  }
}
