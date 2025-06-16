import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
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
  @Input() productosSeleccionados: { producto: Producto; cantidad: number }[] = [];
  @Output() confirmarCompra = new EventEmitter<void>();

  tipoCambioUSD: number = 0;

  constructor(private bcraService: BcraService) {}

  ngOnInit(): void {
    this.bcraService.obtenerTipoCambioCada30Min().subscribe(valor => {
      console.log('Cotización USD recibida:', valor);
      this.tipoCambioUSD = valor;
    });
  }

  get totalARS(): number {
    return this.productosSeleccionados.reduce(
      (total, item) => total + item.producto.precioARS * item.cantidad,
      0
    );
  }

  get totalUSD(): number {
    return this.tipoCambioUSD ? this.totalARS / this.tipoCambioUSD : 0;
  }

  confirmar() {
    this.confirmarCompra.emit();
  }

  cancelar() {
    this.productosSeleccionados = [];
    this.tipoCambioUSD = 0;
  }
}