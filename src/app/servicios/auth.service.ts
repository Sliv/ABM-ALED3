import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';

interface User {
  username: string;
  password: string;
  rol: string; // 🔄 cambiado de 'role' a 'rol'
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usersKey = 'users';

  constructor(private http: HttpClient) {
    this.loadUsers();
  }

  // Carga users.json si no hay usuarios en localStorage
  private loadUsers(): void {
    const users = localStorage.getItem(this.usersKey);
    if (!users) {
      this.http.get<User[]>('assets/Usuarios.json').subscribe(data => {
        localStorage.setItem(this.usersKey, JSON.stringify(data));
        console.log('Usuarios precargados desde users.json:', data);
      });
    }
  }

  // Login con Observable
  login(username: string, password: string): Observable<any> {
    const users: User[] = JSON.parse(localStorage.getItem(this.usersKey) || '[]');
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      return of({ user }); // retorna objeto con el usuario
    } else {
      return throwError(() => new Error('Usuario o contraseña incorrectos'));
    }
  }

  // Registro con Observable
  register(username: string, password: string, rol: string = 'usuario'): Observable<any> {
    const users: User[] = JSON.parse(localStorage.getItem(this.usersKey) || '[]');

    if (users.find(u => u.username === username)) {
      return throwError(() => new Error('El usuario ya existe'));
    }

    const newUser: User = { username, password, rol };
    users.push(newUser);
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    return of({ user: newUser });
  }

  logout(): void {
    localStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('user');
  }
}