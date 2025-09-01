import { Component, OnInit } from '@angular/core';  
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  menuVisible: boolean = false;
  estaLogueado: boolean = false;
  rol: string | null = null; 

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.verificarEstadoLogin();

    this.router.events
      .pipe(filter(evento => evento instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarEstadoLogin();
      });
  }

  alternarMenu(): void {
    this.menuVisible = !this.menuVisible;
  }

  verificarEstadoLogin(): void {
    const usuarioJSON = localStorage.getItem('usuario');  
    const usuario = usuarioJSON ? JSON.parse(usuarioJSON) : null;
    this.estaLogueado = !!usuario;
    this.rol = usuario?.rol || null;
  }

  cerrarSesion(): void {
    localStorage.removeItem('usuario'); 
    this.estaLogueado = false;
    this.rol = null;
    this.router.navigate(['login']);
  }
}
