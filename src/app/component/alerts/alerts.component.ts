import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.css']
})
export class AlertsComponent implements OnInit {
  @Input() mensaje: string = '';
  @Input() duracion: number = 3000; 

  visible = true;

  ngOnInit() {
    setTimeout(() => {
      this.visible = false;
    }, this.duracion);
  }
}