import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NewsletterService } from '../../services/newsletter';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  newsletterEmail = '';
  subscribed = false;

  constructor(
    private newsletterService: NewsletterService,
    private toastService: ToastService
  ) {}

  subscribeNewsletter() {
    if (!this.newsletterEmail.trim()) {
      this.toastService.error('Ingresa tu email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.newsletterEmail)) {
      this.toastService.error('Email inválido');
      return;
    }

    this.newsletterService.subscribe(this.newsletterEmail).subscribe({
      next: () => {
        this.subscribed = true;
        this.newsletterEmail = '';
        this.toastService.success('¡Suscrito a nuestro boletín!');
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Error al suscribirse');
      }
    });
  }
}
