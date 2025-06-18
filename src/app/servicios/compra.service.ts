import { Injectable } from '@angular/core';
import { Compra } from '../Modelos/compra.model';

@Injectable({
  providedIn: 'root'
})
export class CompraService {

  private obtenerUsername(): string | null {
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
    return user?.username || null;
  }

  obtenerCompras(): Compra[] {
    const username = this.obtenerUsername();
    if (!username) return [];
    
    const data = localStorage.getItem(`historialCompras_${username}`);
    return data ? JSON.parse(data) : [];
  }

  agregarCompra(compra: Compra): void {
    const username = this.obtenerUsername();
    if (!username) return;

    const historial = this.obtenerCompras();
    historial.push(compra);
    localStorage.setItem(`historialCompras_${username}`, JSON.stringify(historial));
  }

  limpiarHistorial(): void {
    const username = this.obtenerUsername();
    if (!username) return;

    localStorage.removeItem(`historialCompras_${username}`);
  }
}