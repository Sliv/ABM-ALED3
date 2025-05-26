import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faqs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.css']
})
export class FaqComponent { 
  faqs = [
    { pregunta: '¿Cómo puedo crear una cuenta?', respuesta: '1', estaAbierto: false },
    { pregunta: '¿Cómo puedo editar una cuenta?', respuesta: '2', estaAbierto: false }
  ];

  toggleRespuesta(faq: any): void {
    faq.estaAbierto = !faq.estaAbierto;
  }

  expandirTodos(): void {
    this.faqs.forEach(faq => faq.estaAbierto = true);
  }

  contraerTodos(): void {
    this.faqs.forEach(faq => faq.estaAbierto = false);
  }
}