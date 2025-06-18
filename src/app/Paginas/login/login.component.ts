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
          console.log('Respuesta del backend:', res);
          alert('Login exitoso');
          this.router.navigate(['']);
        },
        error: err => {
          console.error('Error al iniciar sesión:', err);
          // Si err.error.message viene del backend, lo mostramos, si no mostramos mensaje genérico
          this.errorMessage = err.error?.message || err.message || 'Error en el login';
        }
      });
    } else {
      this.errorMessage = 'Por favor completá todos los campos.';
    }
  }
}
