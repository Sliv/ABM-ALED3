import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.css'],
})
export class AlertsComponent implements OnChanges {
  @Input() mensaje: string = '';
  @Input() tipo: 'exito' | 'error' | 'info' | 'advertencia' = 'info';
  @Input() visible: boolean = false;
  @Input() duracion: number = 20000; 
  @Output() cerrado = new EventEmitter<void>();

  private timeoutId?: any;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible'] && this.visible) {
      if (this.timeoutId) clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => this.cerrar(), this.duracion);
    }
  }

  cerrar() {
    this.visible = false;
    this.cerrado.emit();
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }
}