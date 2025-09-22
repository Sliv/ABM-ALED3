import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      console.log('Intentando login con:', username, password);

      this.authService.login(username, password).subscribe({
        next: res => {
          console.log('Usuario autenticado:', res);
          alert('Login exitoso');
          this.router.navigate(['']);
        },
        error: err => {
          console.error('Error al iniciar sesión:', err);

          if (err.code === 'auth/user-not-found') {
            this.errorMessage = 'Usuario no encontrado';
          } else if (err.code === 'auth/wrong-password') {
            this.errorMessage = 'Contraseña incorrecta';
          } else {
            this.errorMessage = 'Error en el login: ' + (err.message || '');
          }
        }
      });
    } else {
      this.errorMessage = 'Por favor completá todos los campos.';
    }
  }
}

// SilviaS silvia.sanchez@fakeemail.com
