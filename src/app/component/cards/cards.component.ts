import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css']
})
export class CardsComponent {
  @Input() imgs: string[] = [];
  @Input() titulo: string = '';
  @Input() precio: string = '';
  @Input() descripcion: string = '';
  @Input() beneficios: string[] = [];
  @Input() botones: { texto: string, enlace: string }[] = [];
  @Input() iconos: string[] = [];
  @Input() linkInfo: string = '';
}