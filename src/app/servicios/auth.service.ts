import { Injectable } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile, 
  onAuthStateChanged,
  User as FirebaseUser 
} from '@angular/fire/auth';
import { from, Observable, map, tap, BehaviorSubject } from 'rxjs';
import { User } from '../Modelos/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private auth: Auth) {
    // Escuchar cambios de login/logout en Firebase
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        const u: User = {
          username: user.displayName || user.email || '',
          password: '',
          rol: 'usuario'
        };
        this.currentUserSubject.next(u);
        localStorage.setItem('usuario', JSON.stringify(u));
      } else {
        this.currentUserSubject.next(null);
        localStorage.removeItem('usuario');
      }
    });
  }

  register(email: string, password: string, username?: string, rol: string = 'usuario'): Observable<User> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      tap(async (res) => {
        if (username) {
          await updateProfile(res.user, { displayName: username });
        }
      }),
      map(res => {
        return {
          username: res.user.displayName || email,
          password: '',
          rol
        };
      })
    );
  }

  login(email: string, password: string): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map(res => {
        return {
          username: res.user.displayName || res.user.email || '',
          password: '',
          rol: 'usuario'
        };
      })
    );
  }

  logout(): void {
    signOut(this.auth);
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}