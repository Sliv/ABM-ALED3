import { Injectable } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile, 
  User as FirebaseUser 
} from '@angular/fire/auth';
import { from, Observable, map, tap } from 'rxjs';
import { User } from '../Modelos/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth) {}

  // REGISTRO
  register(email: string, password: string, username?: string, rol: string = 'usuario'): Observable<User> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      tap(async (res) => {
        if (username) {
          await updateProfile(res.user, { displayName: username });
        }
      }),
      map(res => {
        const u: User = {
          username: res.user.displayName || email,
          password: '', // 🚫 nunca guardes password localmente
          rol
        };
        localStorage.setItem('usuario', JSON.stringify(u)); // opcional, solo para cache rápida
        return u;
      })
    );
  }

  // LOGIN
  login(email: string, password: string): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map(res => {
        const u: User = {
          username: res.user.displayName || res.user.email || '',
          password: '', // 🚫 no guardamos password
          rol: 'usuario' // ⚠️ en Firebase tendrías que manejar roles en Firestore, no hardcodeado
        };
        return u;
      })
    );
  }

  // LOGOUT
  logout(): void {
    signOut(this.auth);
    localStorage.removeItem('usuario');
  }

  // VERIFICAR SESIÓN
  isLoggedIn(): boolean {
    return !!localStorage.getItem('usuario');
  }

  // OBTENER USUARIO ACTUAL
  getCurrentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }
}