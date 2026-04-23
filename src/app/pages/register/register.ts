import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  error = '';
  fieldErrors: any = {};

  constructor(private authService: AuthService, private router: Router) {}

  validate(): boolean {
    this.fieldErrors = {};

    if (!this.firstName.trim()) {
      this.fieldErrors.firstName = 'El nombre es obligatorio';
    }
    if (!this.lastName.trim()) {
      this.fieldErrors.lastName = 'El apellido es obligatorio';
    }
    if (!this.email.trim()) {
      this.fieldErrors.email = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.fieldErrors.email = 'El correo no es válido';
    }
    if (!this.password) {
      this.fieldErrors.password = 'La contraseña es obligatoria';
    } else if (this.password.length < 8) {
      this.fieldErrors.password = 'Mínimo 8 caracteres';
    } else if (!/(?=.*[A-Z])/.test(this.password)) {
      this.fieldErrors.password = 'Debe tener al menos una mayúscula';
    } else if (!/(?=.*[0-9])/.test(this.password)) {
      this.fieldErrors.password = 'Debe tener al menos un número';
    }
    if (!this.confirmPassword) {
      this.fieldErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (this.password !== this.confirmPassword) {
      this.fieldErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    return Object.keys(this.fieldErrors).length === 0;
  }

  onSubmit() {
    this.error = '';
    if (!this.validate()) return;

    this.loading = true;
    this.authService.register({
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim().toLowerCase(),
      password: this.password
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login'], { queryParams: { registered: true } });
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 409) {
          this.fieldErrors.email = 'Este correo ya está registrado';
        } else {
          this.error = err.error?.message || 'Error al registrarse. Intenta de nuevo.';
        }
      }
    });
  }
}