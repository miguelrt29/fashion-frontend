import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {
  email = '';
  emailFocused = false;
  submitted = false;
  loading = false;

  constructor(
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  onSubmit() {
    if (!this.email.trim()) {
      this.toastService.error('Ingresa tu correo electrónico');
      return;
    }

    this.loading = true;
    
    this.authService.forgotPassword(this.email.trim()).subscribe({
      next: () => {
        this.loading = false;
        this.submitted = true;
        this.toastService.success('Te hemos enviado un enlace para restablecer tu contraseña');
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        if (err.status === 0) {
          this.toastService.error('No se pudo conectar al servidor');
        } else {
          this.toastService.error(err.error?.message || 'Error al solicitar recuperación');
        }
      }
    });
  }
}