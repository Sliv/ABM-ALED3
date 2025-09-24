import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { auth } from '../../../environments/firebase.config'; 

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

  async verificarEstadoLogin(): Promise<void> {
    const user = auth.currentUser;

    if (user) {
      this.estaLogueado = true;

      const token = await user.getIdTokenResult(true);
      this.rol = token.claims['admin'] ? 'administrador' : 'usuario';
    } else {
      this.estaLogueado = false;
      this.rol = null;
    }
  }

  cerrarSesion(): void {
    auth.signOut(); 
    this.estaLogueado = false;
    this.rol = null;
    this.router.navigate(['login']);
  }
}