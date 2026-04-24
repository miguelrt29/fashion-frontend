import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../services/products';
import { CartService } from '../../services/cart';
import { ReviewsService, Review, ReviewStats } from '../../services/reviews';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';
import { RecentlyViewedService } from '../../services/recently-viewed';
import { SizeGuide } from '../../components/size-guide/size-guide';

type ReviewSortOption = 'recent' | 'helpful' | 'highest' | 'lowest';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SizeGuide],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit {
  product: any = null;
  loading = true;
  selectedSize = '';
  selectedColor = '';
  quantity = 1;
  added = false;

  relatedProducts: any[] = [];
  showSizeGuide = false;
  activeImageIndex = 0;
  showFullscreenImage = false;
  isMobile = false;
  zoomLevel = 1;
  isZoomed = false;
  zoomPosition = { x: 50, y: 50 };

  reviews: Review[] = [];
  stats: ReviewStats = { average: 0, count: 0, total: 0, distribution: [], withPhotos: 0, verifiedReviews: 0 };
  currentPage = 1;
  sortBy: ReviewSortOption = 'recent';
  
  showReviewForm = false;
  reviewForm = {
    rating: 5,
    title: '',
    comment: '',
    pros: '',
    cons: ''
  };

  showFullDescription = false;

  constructor(
    private productsService: ProductsService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router,
    private reviewsService: ReviewsService,
    private authService: AuthService,
    private toastService: ToastService,
    private recentlyViewedService: RecentlyViewedService
  ) {}

  ngOnInit() {
    this.isMobile = window.innerWidth < 768;
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 768;
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    }
  }

  loadProduct(id: string) {
    this.loading = true;
    
    this.productsService.getOne(id).subscribe({
      next: (product) => {
        if (product) {
          this.product = product;
          this.selectedSize = product.sizes?.[0] || '';
          this.selectedColor = product.colors?.[0] || '';
          this.recentlyViewedService.addItem(product);
          this.loadReviews();
          this.loadRelatedProducts(product.category);
        } else {
          this.loadMockProduct(id);
        }
        this.loading = false;
      },
      error: () => {
        this.loadMockProduct(id);
        this.loading = false;
      }
    });
  }

  loadMockProduct(id: string) {
    const mockProducts: { [key: string]: any } = {
      '1': {
        id: 1, name: 'Camiseta Básica Premium', price: 89900, discount: 0,
        category: 'Mujer', brand: 'FashionStore',
        images: ['https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg'],
        thumbnail: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
        rating: 4.5, stock: 10, description: 'Camiseta de alta calidad con materiales premium. Perfecta para el día a día.',
        sizes: ['S', 'M', 'L', 'XL'], colors: ['Negro', 'Blanco', 'Gris', 'Azul']
      },
      '2': {
        id: 2, name: 'Camisa de Malla Clásica', price: 129900, discount: 15,
        category: 'Hombre', brand: 'FashionStore',
        images: ['https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UZ_.jpg'],
        thumbnail: 'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UZ_.jpg',
        rating: 4.2, stock: 8, description: 'Camisa elegante de malla transpirable. Ideal para cualquier ocasión.',
        sizes: ['S', 'M', 'L', 'XL'], colors: ['Negro', 'Blanco', 'Azul']
      },
      '3': {
        id: 3, name: 'Camisa de Algodón', price: 79900, discount: 0,
        category: 'Mujer', brand: 'FashionStore',
        images: ['https://fakestoreapi.com/img/71liYOujAOL._AC_SY879._SX._UX._SY._UZ_.jpg'],
        thumbnail: 'https://fakestoreapi.com/img/71liYOujAOL._AC_SY879._SX._UX._SY._UZ_.jpg',
        rating: 4.8, stock: 15, description: 'Camisa cómoda de algodón 100%. Suave al tacto.',
        sizes: ['XS', 'S', 'M', 'L'], colors: ['Blanco', 'Rosa', 'Azul']
      },
      '4': {
        id: 4, name: 'Chaqueta de Cuero', price: 199900, discount: 20,
        category: 'Hombre', brand: 'FashionStore',
        images: ['https://fakestoreapi.com/img/71pWzhd+JvL._AC_UY880_.jpg'],
        thumbnail: 'https://fakestoreapi.com/img/71pWzhd+JvL._AC_UY880_.jpg',
        rating: 4.6, stock: 5, description: 'Chaqueta de cuero genuino. Diseño clásico y elegante.',
        sizes: ['M', 'L', 'XL', 'XXL'], colors: ['Negro', 'Café']
      }
    };

    this.product = mockProducts[id] || {
      id: id, name: 'Producto', price: 99900, discount: 0,
      category: 'Moda', brand: 'FashionStore',
      images: ['https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg'],
      thumbnail: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
      rating: 4.0, stock: 10, description: 'Producto de moda con la mejor calidad.',
      sizes: ['S', 'M', 'L'], colors: ['Negro', 'Blanco']
    };

    this.selectedSize = this.product.sizes[0];
    this.selectedColor = this.product.colors[0];
    this.recentlyViewedService.addItem(this.product);
    this.loadReviews();
    this.loadRelatedProducts(this.product.category);
  }

  loadRelatedProducts(category: string) {
    this.productsService.getAll().subscribe({
      next: (products) => {
        this.relatedProducts = products
          .filter(p => p.category === category && p.id !== this.product.id)
          .slice(0, 4);
      }
    });
  }

  loadReviews() {
    if (!this.product) return;
    this.reviews = this.reviewsService.getReviewsForProduct(this.product.id, this.currentPage);
    this.stats = this.reviewsService.getStatsForProduct(this.product.id);
  }

  sortReviews(sort: ReviewSortOption) {
    this.sortBy = sort;
    let allReviews = this.reviewsService.getAllReviewsForProduct(this.product.id);
    
    switch (sort) {
      case 'recent':
        allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'helpful':
        allReviews.sort((a, b) => (b.helpful || 0) - (a.helpful || 0));
        break;
      case 'highest':
        allReviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        allReviews.sort((a, b) => a.rating - b.rating);
        break;
    }

    this.reviews = allReviews.slice(0, this.currentPage * 10);
  }

  loadMoreReviews() {
    this.currentPage++;
    const allReviews = this.reviewsService.getReviewsForProduct(this.product.id, this.currentPage);
    this.reviews = [...this.reviews, ...allReviews];
  }

  decreaseQuantity() {
    if (this.quantity > 1) this.quantity--;
  }

  increaseQuantity() {
    if (this.product && this.quantity < this.product.stock) this.quantity++;
  }

  addToCart() {
    if (!this.selectedSize || !this.selectedColor) {
      this.toastService.error('Selecciona talla y color');
      return;
    }
    
    this.cartService.addItem({
      productId: this.product.id,
      name: this.product.name,
      price: this.product.price,
      quantity: this.quantity,
      size: this.selectedSize,
      color: this.selectedColor,
      image: this.product.images?.[0] || ''
    });
    
    this.added = true;
    this.toastService.success(`${this.product.name} añadido al carrito`);
    setTimeout(() => this.added = false, 2000);
  }

  buyNow() {
    if (!this.selectedSize || !this.selectedColor) {
      this.toastService.error('Selecciona talla y color');
      return;
    }
    
    this.cartService.addItem({
      productId: this.product.id,
      name: this.product.name,
      price: this.product.price,
      quantity: this.quantity,
      size: this.selectedSize,
      color: this.selectedColor,
      image: this.product.images?.[0] || ''
    });
    
    this.router.navigate(['/checkout']);
  }

  toggleReviewForm() {
    this.showReviewForm = !this.showReviewForm;
    if (!this.showReviewForm) this.resetReviewForm();
  }

  resetReviewForm() {
    this.reviewForm = { rating: 5, title: '', comment: '', pros: '', cons: '' };
  }

  setRating(stars: number) {
    this.reviewForm.rating = stars;
  }

  submitReview() {
    if (!this.reviewForm.comment.trim()) {
      this.toastService.error('Escribe tu experiencia con el producto');
      return;
    }

    if (!this.reviewForm.title.trim()) {
      this.toastService.error('Añade un título a tu reseña');
      return;
    }

    const user = this.authService.getUser();
    const pros = this.reviewForm.pros.split(',').map(p => p.trim()).filter(p => p);
    const cons = this.reviewForm.cons.split(',').map(c => c.trim()).filter(c => c);

    this.reviewsService.addReview(
      this.product.id,
      this.reviewForm.rating,
      this.reviewForm.comment,
      this.reviewForm.title,
      user?.firstName + ' ' + user?.lastName || 'Usuario',
      user?.id || 'guest',
      pros,
      cons,
      [],
      !!user
    );

    this.loadReviews();
    this.toastService.success('Tu reseña ha sido publicada');
    this.toggleReviewForm();
  }

  markHelpful(reviewId: string) {
    this.reviewsService.markHelpful(reviewId);
    this.loadReviews();
  }

  getStars(rating: number): boolean[] {
    return [1, 2, 3, 4, 5].map(i => i <= rating);
  }

  getProgressWidth(percentage: number): string {
    return `${percentage}%`;
  }

  getDistributionStars(index: number): number {
    return 5 - index;
  }

  getDistributionPercentage(index: number): number {
    if (!this.stats.total || !this.stats.distribution[index]) return 0;
    return Math.round((this.stats.distribution[index] / this.stats.total) * 100);
  }

  getDistributionCount(index: number): number {
    return this.stats.distribution[index] || 0;
  }

  get totalPages(): number {
    return Math.ceil(this.stats.total / 10);
  }

  get hasMoreReviews(): boolean {
    return this.currentPage < this.totalPages;
  }

  get isLoggedIn(): boolean {
    return !!this.authService.getUser();
  }

  openFullscreenImage() {
    this.showFullscreenImage = true;
    document.body.style.overflow = 'hidden';
  }

  closeFullscreenImage() {
    this.showFullscreenImage = false;
    this.isZoomed = false;
    this.zoomLevel = 1;
    this.zoomPosition = { x: 50, y: 50 };
    document.body.style.overflow = '';
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('fullscreen-overlay')) {
      this.closeFullscreenImage();
    }
  }

  toggleZoom(event: MouseEvent) {
    event.stopPropagation();
    if (this.isZoomed) {
      this.isZoomed = false;
      this.zoomLevel = 1;
      this.zoomPosition = { x: 50, y: 50 };
    } else {
      this.isZoomed = true;
      this.zoomLevel = 2;
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      this.zoomPosition = {
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100
      };
    }
  }

  onZoomMove(event: MouseEvent) {
    if (!this.isZoomed) return;
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.zoomPosition = {
      x: Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100))
    };
  }

  openSizeGuide() {
    this.showSizeGuide = true;
  }

  closeSizeGuide() {
    this.showSizeGuide = false;
  }

  setActiveImage(index: number) {
    this.activeImageIndex = index;
  }
}