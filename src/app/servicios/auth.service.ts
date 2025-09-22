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
          password: '', 
          rol
        };
        localStorage.setItem('usuario', JSON.stringify(u)); 
        return u;
      })
    );
  }

  login(email: string, password: string): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map(res => {
        const u: User = {
          username: res.user.displayName || res.user.email || '',
          password: '', 
          rol: 'usuario' 
        };
        return u;
      })
    );
  }

  logout(): void {
    signOut(this.auth);
    localStorage.removeItem('usuario');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('usuario');
  }

  getCurrentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }
}