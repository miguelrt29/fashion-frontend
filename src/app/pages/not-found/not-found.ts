import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../services/products';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css'
})
export class NotFound {
  popularProducts: any[] = [];
  loading = true;

  constructor(private productsService: ProductsService) {
    this.loadPopularProducts();
  }

  loadPopularProducts() {
    this.productsService.getAll().subscribe({
      next: (products) => {
        this.popularProducts = products.slice(0, 4);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}