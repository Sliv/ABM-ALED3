import { Injectable } from '@angular/core';
import { Compra } from '../Modelos/compra.model';

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private key = 'historialCompras';

  obtenerCompras(): Compra[] {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : [];
  }

  agregarCompra(compra: Compra): void {
    const historial = this.obtenerCompras();
    historial.push(compra);
    localStorage.setItem(this.key, JSON.stringify(historial));
  }

  limpiarHistorial(): void {
    localStorage.removeItem(this.key);
  }
}