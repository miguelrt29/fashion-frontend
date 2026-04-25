import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
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
  selectedGender = '';
  selectedCategory = '';

  minPrice = 0;
  maxPrice = 1000000;
  selectedMinPrice = 0;
  selectedMaxPrice = 1000000;

  genders = [
    { name: 'Todos', slug: '' },
    { name: 'Mujer', slug: 'mujer' },
    { name: 'Hombre', slug: 'hombre' }
  ];

  categories = [
    { name: 'Todos', slug: '' },
    { name: 'Vestidos', slug: 'vestidos' },
    { name: 'Pantalones', slug: 'pantalones' },
    { name: 'Blusas', slug: 'blusas' },
    { name: 'Zapatos', slug: 'zapatos' },
    { name: 'Accesorios', slug: 'accesorios' },
    { name: 'Camisetas', slug: 'camisetas' },
    { name: 'Camisas', slug: 'camisas' },
    { name: 'Chaquetas', slug: 'chaquetas' }
  ];

  searchHistory: string[] = [];
  showSearchHistory = false;
  showFilters = false;

  constructor(
    private productsService: ProductsService,
    private route: ActivatedRoute,
    private router: Router,
    private searchHistoryService: SearchHistoryService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.selectedGender = params['gender'] || '';
      this.selectedCategory = params['category'] || '';
      this.loadProducts();
    });

    this.searchHistoryService.history$.subscribe(history => {
      this.searchHistory = history;
    });
  }

  loadProducts() {
    this.loading = true;
    this.productsService.getAll(this.selectedGender, this.selectedCategory, this.search).subscribe({
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

  selectGender(slug: string) {
    this.selectedGender = slug;
    this.selectedCategory = '';
    this.router.navigate([], {
      queryParams: { gender: slug || null, category: null },
      queryParamsHandling: 'merge'
    });
  }

  selectCategory(slug: string) {
    this.selectedCategory = slug;
    this.router.navigate([], {
      queryParams: { category: slug || null },
      queryParamsHandling: 'merge'
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

  get visibleCategories() {
    const allCats = [
      { name: 'Todos', slug: '' },
      { name: 'Vestidos', slug: 'vestidos' },
      { name: 'Pantalones', slug: 'pantalones' },
      { name: 'Blusas', slug: 'blusas' },
      { name: 'Zapatos', slug: 'zapatos' },
      { name: 'Accesorios', slug: 'accesorios' },
      { name: 'Camisetas', slug: 'camisetas' },
      { name: 'Camisas', slug: 'camisas' },
      { name: 'Chaquetas', slug: 'chaquetas' }
    ];
    
    if (this.selectedGender === 'hombre') {
      return allCats.filter(c => c.slug === '' || !['vestidos', 'blusas'].includes(c.slug));
    }
    return allCats.filter(c => c.slug === '' || !['camisetas', 'camisas', 'chaquetas'].includes(c.slug));
  }

  getPageTitle(): string {
    const gender = this.genders.find(g => g.slug === this.selectedGender);
    const category = this.categories.find(c => c.slug === this.selectedCategory);

    if (this.selectedGender && this.selectedCategory) {
      return `${gender?.name} - ${category?.name}`;
    } else if (this.selectedGender) {
      return gender?.name === 'Todos' ? 'Todos los productos' : `${gender?.name}`;
    } else if (this.selectedCategory) {
      return category?.name === 'Todos' ? 'Todos los productos' : `${category?.name}`;
    }
    return 'Todos los productos';
  }

  resetAll() {
    this.selectedGender = '';
    this.selectedCategory = '';
    this.search = '';
    this.resetFilters();
    this.router.navigate([], {
      queryParams: { gender: null, category: null },
      queryParamsHandling: 'merge'
    });
  }
}