import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { User } from '../Modelos/user.model'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  register(username: string, password: string, rol: string = 'usuario'): Observable<any> {
    return this.http.post(`${this.apiUrl}/sign-up`, { username, password, rol }).pipe(
      catchError(err => throwError(() => new Error(err.error?.message || 'Error en el registro')))
    );
  }

  login(username: string, password: string): Observable<{ mensaje: string; usuario: User }> {
    return this.http.post<{ mensaje: string; usuario: User }>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap((res) => {
        localStorage.setItem('usuario', JSON.stringify(res.usuario));
      }),
      catchError(err => throwError(() => new Error(err.error?.message || 'Credenciales inválidas')))
    );
  }

  logout(): void {
    localStorage.removeItem('usuario');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('usuario');
  }
}
