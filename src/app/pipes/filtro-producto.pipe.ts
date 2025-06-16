import { Pipe, PipeTransform } from '@angular/core';
import { Producto } from '../Modelos/producto';

@Pipe({
  name: 'filtroProducto'
})
export class FiltroProductoPipe implements PipeTransform {
  transform(productos: Producto[], filtro: string): Producto[] {
    if (!productos || !filtro) return productos;
    const texto = filtro.toLowerCase();
    return productos.filter(p =>
      p.nombre.toLowerCase().includes(texto) ||
      p.categoria.toLowerCase().includes(texto)
    );
  }
}