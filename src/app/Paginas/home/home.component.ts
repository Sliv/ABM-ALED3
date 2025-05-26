import { Component } from '@angular/core';
// import { CardsComponent } from "../../component/cards/cards.component"; Agregar después.
import { FaqComponent } from "../../component/faqs/faqs.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [FaqComponent]
})
export class HomeComponent {
}