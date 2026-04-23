import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../services/products';
import { ProductCard } from '../../shared/product-card/product-card';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ProductCard],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {
  products: any[] = [];
  loading = true;
  search = '';
  selectedCategory = '';

  categories = [
    { name: 'TODO', slug: '' },
    { name: 'MUJER', slug: "women's clothing" },
    { name: 'HOMBRE', slug: "men's clothing" },
    { name: 'JOYERÍA', slug: "jewelery" }
  ];

  constructor(
    private productsService: ProductsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['category'] || '';
      this.loadProducts();
    });
  }

  loadProducts() {
    this.loading = true;
    this.productsService.getAll(this.selectedCategory, this.search).subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onSearch() {
    this.loadProducts();
  }

  selectCategory(slug: string) {
    this.selectedCategory = slug;
    this.loadProducts();
  }
}