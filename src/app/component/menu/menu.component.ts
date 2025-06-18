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
  isLoggedIn: boolean = false;
  rol: string | null = null; 

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkLoginStatus();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkLoginStatus();
      });
  }

  toggleMenu() {
    this.menuVisible = !this.menuVisible;
  }

  checkLoginStatus(): void {
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    this.isLoggedIn = !!user;
    this.rol = user?.rol || null;
  }

  logout(): void {
    localStorage.removeItem('user');
    this.isLoggedIn = false;
    this.rol = null;
    this.router.navigate(['login']);
  }
}