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
  signUpForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.signUpForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.signUpForm.valid) {
      const { username, password } = this.signUpForm.value;

      this.authService.register(username, password).subscribe({
        next: () => {
          alert('Usuario registrado exitosamente');
          this.router.navigate(['login']);
        },
        error: err => {
          console.error('Error en el registro:', err);
          this.errorMessage = err.message || 'Error en el registro';
        }
      });
    }
  }
}