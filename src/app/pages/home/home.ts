import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../services/products';
import { ProductCard } from '../../shared/product-card/product-card';

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

  constructor(private productsService: ProductsService) {}

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
    if (this.newsletterEmail) {
      alert(`¡Gracias! Te has suscrito con ${this.newsletterEmail}`);
      this.newsletterEmail = '';
    }
  }
}