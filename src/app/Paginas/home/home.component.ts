import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaqComponent } from "../../component/faqs/faqs.component";
import { CarouselComponent } from "../../component/carousel/carousel.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FaqComponent, CarouselComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  faqData = [
    {
      pregunta: '¿Cómo puedo crear una cuenta?',
      respuesta: 'Para crear una cuenta, hacé click en el botón de Registrarse e ingresá tus datos (Nombre de usuario y Contraseña)'
    },
    {
      pregunta: '¿Cómo puedo loguearme?',
      respuesta: 'Para loguearse, hacé click en el bóton de Iniciar Sesión e ingresá los datos correspondientes.'
    },
    {
      pregunta: '¿Cómo puedo comprar?',
      respuesta: 'Para comprar, hacé click en el bóton de Comprar y observá los productos que están en venta. Debes haber iniciado sesión previamente. Luego, clickea la carta del producto y selecciona cómo deseas comprar (Añadiéndolo al carrito para comprar múltiples productos o Comprar producto).'
    }
  ];
}