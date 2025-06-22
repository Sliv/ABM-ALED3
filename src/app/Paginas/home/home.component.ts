import { Component } from '@angular/core';
import { FaqComponent } from "../../component/faqs/faqs.component";



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [FaqComponent]
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
      respuesta: 'Para comprar, hacé click en el bóton de Comprar y observá los productos que están en venta, para comprarlos debes haber iniciado sesión previamente. Luego, clickea la carta del producto y selecciona la opción de cómo deseas comprar (Añadiendolo al carrito, para comprar multiples productos o Comprar producto)'
    }
  ];
}