import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  showPassword = false;
  loading = false;
  googleLoading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  onSubmit() {
    if (!this.email || !this.password) {
      this.error = 'Por favor completa todos los campos';
      return;
    }
    this.loading = true;
    this.error = '';
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Credenciales incorrectas';
      }
    });
  }

  loginWithGoogle() {
    this.googleLoading = true;
    
    setTimeout(() => {
      const mockGoogleUser = {
        firstName: 'Usuario',
        lastName: 'Google',
        email: this.email || 'usuario.google@gmail.com',
        id: 'google_' + Date.now()
      };
      
      localStorage.setItem('user', JSON.stringify(mockGoogleUser));
      localStorage.setItem('token', 'google_token_' + Date.now());
      this.toastService.success('¡Bienvenido! Has iniciado sesión con Google');
      this.googleLoading = false;
      this.router.navigate(['/']);
    }, 1500);
  }
}