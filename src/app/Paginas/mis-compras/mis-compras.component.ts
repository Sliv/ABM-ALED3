import { Component, OnInit } from '@angular/core';
import { CompraService } from '../../servicios/compra.service';
import { Compra } from '../../Modelos/compra.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mis-compras',
  imports: [CommonModule],
  templateUrl: './mis-compras.component.html',
  styleUrls: ['./mis-compras.component.css']
})
export class MisComprasComponent implements OnInit {
  compras: Compra[] = [];

  constructor(private compraService: CompraService) {}

  ngOnInit(): void {

    const comprasData = this.compraService.obtenerCompras();

    this.compras = comprasData.map(c => ({
      ...c,
      fecha: new Date(c.fecha) 
    }));
  }
}