import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../servicios/producto.service';
import { Producto } from '../../Modelos/producto';
import { FiltroProductoPipe } from '../../pipes/filtro-producto.pipe';

@Component({
  selector: 'app-producto',
  standalone: true,
  templateUrl: './listar-producto.component.html',
  styleUrls: ['./listar-producto.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FiltroProductoPipe
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
      precio: [0, [Validators.required, Validators.min(1)]],
      categoria: ['', Validators.required],
      imagen: ['', Validators.required]
    });
  }

  cargarProductos() {
    this.productoService.obtenerProductos().subscribe({
      next: (data: Producto[]) => {
        this.productos = data;
      },
      error: (err) => console.error('Error al obtener productos:', err)
    });
  }

  async guardarProducto() {
    if (this.productoForm.invalid) return;

    try {
      const productoData: Producto = {
        ...this.productoForm.value,
        id: this.productoEnEdicion?.id
      };

      if (this.modoEdicion && productoData.id) {
        await this.productoService.actualizarProducto(productoData);
        this.modoEdicion = false;
        this.productoEnEdicion = null;
      } else {
        await this.productoService.agregarProducto(productoData);
      }

      this.productoForm.reset();
      this.cargarProductos();
    } catch (err) {
      console.error('Error al guardar producto:', err);
    }
  }

  editarProducto(prod: Producto) {
    this.productoForm.patchValue(prod);
    this.productoEnEdicion = prod;
    this.modoEdicion = true;
  }

  async eliminarProducto(id?: string) {
    if (!id) return;
    try {
      await this.productoService.eliminarProducto(id);
      this.cargarProductos();
    } catch (err) {
      console.error('Error al eliminar producto:', err);
    }
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