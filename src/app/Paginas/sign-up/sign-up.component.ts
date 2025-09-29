import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class SignUpComponent {
  formularioRegistro: FormGroup;
  mensajeError: string = '';
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.formularioRegistro = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(3)]],
      contraseña: ['', [Validators.required, Validators.minLength(4)]],
      rol: ['usuario']
    });
  }

  registrar(): void {
    if (this.formularioRegistro.valid) {
      const { usuario, contraseña, rol } = this.formularioRegistro.value;

      this.authService.register(usuario, contraseña, rol).subscribe({
        next: () => {
          alert("Usuario registrado exitosamente");
          this.router.navigate(['login']);
        },
        error: err => {
          console.error('Error en el registro:', err);
          this.mensajeError = err.message || 'Error en el registro';
        }
      });
    } else {
      this.mensajeError = 'Por favor completá todos los campos correctamente.';
    }
  }
}
