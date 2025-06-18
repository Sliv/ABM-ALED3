import { Component, OnInit } from '@angular/core';
import { Producto } from '../../Modelos/producto';
import { CommonModule } from '@angular/common';
import { BcraService } from '../../servicios/bcra.service';

@Component({
  selector: 'app-factura',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './factura.component.html',
  styleUrls: ['./factura.component.css']
})
export class FacturaComponent implements OnInit {
  productosSeleccionados: { producto: Producto; cantidad: number }[] = [];
  tipoCambioUSD: number = 0;

  constructor(private bcraService: BcraService) {}

  ngOnInit(): void {
    const datos = localStorage.getItem('factura_temp');
    this.productosSeleccionados = datos ? JSON.parse(datos) : [];

    this.bcraService.obtenerTipoCambioUSD().subscribe(valor => {
      this.tipoCambioUSD = valor;
    });
  }

  get totalARS(): number {
    return this.productosSeleccionados.reduce(
      (total, item) => total + item.producto.precio * item.cantidad,
      0
    );
  }

  get totalUSD(): number {
    return this.tipoCambioUSD ? this.totalARS / this.tipoCambioUSD : 0;
  }
}
