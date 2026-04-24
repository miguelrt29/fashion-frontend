import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword implements OnInit {
  token = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  success = false;
  error = '';
  passwordFocused = false;
  confirmFocused = false;
  showPassword = false;
  showConfirmPassword = false;
  passwordErrors: string[] = [];

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.toastService.error('Token inválido o faltante');
      this.router.navigate(['/forgot-password']);
    }
  }

  validatePassword(password: string): string[] {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Debe contener al menos una mayúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Debe contener al menos una minúscula');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Debe contener al menos un número');
    }
    return errors;
  }

  onPasswordChange() {
    this.passwordErrors = this.validatePassword(this.newPassword);
  }

  onSubmit() {
    this.error = '';

    if (!this.newPassword || !this.confirmPassword) {
      this.error = 'Completa todos los campos';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    if (this.passwordErrors.length > 0) {
      this.error = 'La contraseña no cumple los requisitos';
      return;
    }

    this.loading = true;

    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        this.toastService.success('Contraseña actualizada correctamente');
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        if (err.status === 0) {
          this.error = 'No se pudo conectar al servidor';
        } else {
          this.error = err.error?.message || 'Error al restablecer la contraseña';
        }
      }
    });
  }
}