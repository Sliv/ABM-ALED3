import { Component } from '@angular/core';
import { FaqComponent } from "../../component/faqs/faqs.component";



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [FaqComponent]
})
export class HomeComponent {
}