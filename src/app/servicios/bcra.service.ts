import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer, switchMap, map, catchError, of } from 'rxjs';

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

  obtenerTipoCambioUSD(): Observable<number> {
    const hoy = new Date().toISOString().split('T')[0];
    const desde = '2025-06-01';
    const url = `${this.apiUrl}?fechaDesde=${desde}&fechaHasta=${hoy}`;

    return this.http.get<ApiResponse>(url).pipe(
      map(response => {
        const resultados = response.results;
        if (!resultados || resultados.length === 0) {
          return 0;
        }

        const ultimoResultado = resultados[resultados.length - 1];
        if (!ultimoResultado.detalle || ultimoResultado.detalle.length === 0) {
          return 0;
        }

        const detalleUSD = ultimoResultado.detalle.find(d => d.codigoMoneda === 'USD');
        return detalleUSD ? detalleUSD.tipoCotizacion : 0;
      }),
      catchError(() => of(0))
    );
  }

  obtenerTipoCambioCada30Min(): Observable<number> {
    return timer(0, 30 * 60 * 1000).pipe(
      switchMap(() => this.obtenerTipoCambioUSD())
    );
  }
}