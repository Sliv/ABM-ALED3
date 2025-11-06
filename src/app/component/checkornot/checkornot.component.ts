import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkornot',
  standalone: true,        
  imports: [CommonModule], 
  templateUrl: './checkornot.component.html',
  styleUrls: ['./checkornot.component.css']
})
export class CheckornotComponent {
  @Input() valido: boolean = false;
}