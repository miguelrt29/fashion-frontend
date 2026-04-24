import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
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

  constructor(private toastService: ToastService) {}

  onSubmit() {
    if (!this.email.trim()) {
      this.toastService.error('Ingresa tu correo electrónico');
      return;
    }

    this.loading = true;
    
    setTimeout(() => {
      this.loading = false;
      this.submitted = true;
      this.toastService.success('Te hemos enviado un enlace para restablecer tu contraseña');
    }, 1500);
  }
}