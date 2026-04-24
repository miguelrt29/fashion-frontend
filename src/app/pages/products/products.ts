import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../services/products';
import { ProductCard } from '../../shared/product-card/product-card';
import { SearchHistoryService } from '../../services/search-history';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ProductCard],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  loading = true;
  search = '';
  selectedCategory = '';

  minPrice = 0;
  maxPrice = 1000000;
  selectedMinPrice = 0;
  selectedMaxPrice = 1000000;

  categories = [
    { name: 'TODO', slug: '' },
    { name: 'MUJER', slug: "women's clothing" },
    { name: 'HOMBRE', slug: "men's clothing" },
    { name: 'JOYERÍA', slug: "jewelery" }
  ];

  searchHistory: string[] = [];
  showSearchHistory = false;
  showFilters = false;

  constructor(
    private productsService: ProductsService,
    private route: ActivatedRoute,
    private searchHistoryService: SearchHistoryService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['category'] || '';
      this.loadProducts();
    });

    this.searchHistoryService.history$.subscribe(history => {
      this.searchHistory = history;
    });
  }

  loadProducts() {
    this.loading = true;
    this.productsService.getAll(this.selectedCategory, this.search).subscribe({
      next: (products) => {
        this.products = products;
        this.applyFilters();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  applyFilters() {
    this.filteredProducts = this.products.filter(product => {
      const price = product.price;
      return price >= this.selectedMinPrice && price <= this.selectedMaxPrice;
    });
  }

  onSearch() {
    if (this.search.trim()) {
      this.searchHistoryService.addSearch(this.search);
    }
    this.showSearchHistory = false;
    this.loadProducts();
  }

  onSearchFocus() {
    this.showSearchHistory = true;
  }

  onSearchBlur() {
    setTimeout(() => {
      this.showSearchHistory = false;
    }, 200);
  }

  selectHistoryItem(term: string) {
    this.search = term;
    this.onSearch();
  }

  removeHistoryItem(event: Event, term: string) {
    event.stopPropagation();
    this.searchHistoryService.removeSearch(term);
  }

  clearSearchHistory() {
    this.searchHistoryService.clearHistory();
  }

  selectCategory(slug: string) {
    this.selectedCategory = slug;
    this.loadProducts();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  onPriceChange() {
    this.applyFilters();
  }

  resetFilters() {
    this.selectedMinPrice = this.minPrice;
    this.selectedMaxPrice = this.maxPrice;
    this.applyFilters();
  }
}