import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Faq {
  pregunta: string;
  respuesta: string;
  estaAbierto?: boolean; // opcional al recibirlo
}

@Component({
  selector: 'app-faqs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.css']
})
export class FaqComponent {
  @Input() faqs: Faq[] = [];

  toggleRespuesta(faq: Faq): void {
    faq.estaAbierto = !faq.estaAbierto;
  }

  expandirTodos(): void {
    this.faqs.forEach(faq => faq.estaAbierto = true);
  }

  contraerTodos(): void {
    this.faqs.forEach(faq => faq.estaAbierto = false);
  }
}
