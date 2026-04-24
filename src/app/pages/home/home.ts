import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../services/products';
import { ProductCard } from '../../shared/product-card/product-card';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCard, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  featuredProducts: any[] = [];
  loading = true;
  newsletterEmail = '';
  newsletterSubmitted = false;
  newsletterLoading = false;

  constructor(
    private productsService: ProductsService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.productsService.getAll().subscribe({
      next: (products) => {
        this.featuredProducts = products.slice(0, 8);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onNewsletter() {
    if (!this.newsletterEmail.trim()) {
      this.toastService.error('Ingresa tu correo electrónico');
      return;
    }

    if (!this.newsletterEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      this.toastService.error('Ingresa un correo válido');
      return;
    }

    this.newsletterLoading = true;
    
    setTimeout(() => {
      const emails = JSON.parse(localStorage.getItem('newsletter_emails') || '[]');
      if (!emails.includes(this.newsletterEmail)) {
        emails.push(this.newsletterEmail);
        localStorage.setItem('newsletter_emails', JSON.stringify(emails));
      }
      this.newsletterLoading = false;
      this.newsletterSubmitted = true;
      this.toastService.success('¡Gracias por suscribirte! Recibirás las mejores ofertas.');
    }, 1000);
  }
}