import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface DetalleCotizacion {
  codigoMoneda: string;
  descripcion: string;
  tipoPase: number;
  tipoCotizacion: number;
}

interface Resultado {
  fecha: string;
  detalle: DetalleCotizacion[];
}

interface ApiResponse {
  status: number;
  metadata: any;
  results: Resultado[];
}

@Injectable({
  providedIn: 'root'
})
export class BcraService {
  private apiUrl = 'https://api.bcra.gob.ar/estadisticascambiarias/v1.0/Cotizaciones/USD';

  constructor(private http: HttpClient) {}

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const dd = date.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Método actual: devuelve el tipo de cambio más reciente
  obtenerTipoCambioUSD(): Observable<number> {
    const hoy = new Date();
    const fechaHasta = this.formatDate(hoy);

    const desdeDate = new Date(hoy);
    desdeDate.setDate(hoy.getDate() - 30);
    const fechaDesde = this.formatDate(desdeDate);

    const url = `${this.apiUrl}?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`;

    return this.http.get<ApiResponse>(url).pipe(
      map(response => {
        const resultados = response.results;
        if (!resultados || resultados.length === 0) return 0;

        const resultadoMasReciente = resultados[0];
        const detalleUSD = resultadoMasReciente.detalle.find(d => d.codigoMoneda === 'USD');
        return detalleUSD ? detalleUSD.tipoCotizacion : 0;
      }),
      catchError(() => of(0))
    );
  }

  // Nuevo método: devuelve la evolución del USD en los últimos `dias` días
  obtenerEvolucionUSD(dias: number = 7): Observable<{fecha: string, valor: number}[]> {
    const hoy = new Date();
    const fechaHasta = this.formatDate(hoy);

    const desdeDate = new Date(hoy);
    desdeDate.setDate(hoy.getDate() - (dias - 1));
    const fechaDesde = this.formatDate(desdeDate);

    const url = `${this.apiUrl}?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`;

    return this.http.get<ApiResponse>(url).pipe(
      map(response => {
        const resultados = response.results;
        if (!resultados || resultados.length === 0) return [];

        return resultados.map(r => {
          const detalleUSD = r.detalle.find(d => d.codigoMoneda === 'USD');
          return {
            fecha: r.fecha.split('T')[0],
            valor: detalleUSD ? detalleUSD.tipoCotizacion : 0
          };
        }).sort((a, b) => a.fecha.localeCompare(b.fecha));
      }),
      catchError(() => of([]))
    );
  }
}