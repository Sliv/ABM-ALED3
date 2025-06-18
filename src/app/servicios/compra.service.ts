import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Compra } from '../Modelos/compra.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompraService {

  private apiUrl = 'http://localhost:3000/api/compras';

  constructor(private http: HttpClient) {}

  private obtenerUsername(): string | null {
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
    return user?.username || null;
  }

  obtenerCompras(): Observable<Compra[]> {
    const username = this.obtenerUsername();
    if (!username) return of([]);
    return this.http.get<Compra[]>(`${this.apiUrl}/${username}`);
  }

  agregarCompra(compra: Compra): Observable<Compra> {
    const username = this.obtenerUsername();
    if (!username) throw new Error('Usuario no autenticado');
    return this.http.post<Compra>(`${this.apiUrl}/${username}`, compra);
  }

  limpiarHistorial(): Observable<any> {
    const username = this.obtenerUsername();
    if (!username) throw new Error('Usuario no autenticado');
    return this.http.delete(`${this.apiUrl}/${username}`);
  }
}
