import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart';
import { FavoritesService } from '../../services/favorites';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-quick-view',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './quick-view.html',
  styleUrl: './quick-view.css'
})
export class QuickView {
  @Input() product: any = null;
  @Input() visible = false;
  @Output() close = new EventEmitter<void>();

  selectedSize = '';
  selectedColor = '';
  quantity = 1;
  added = false;

  constructor(
    private cartService: CartService,
    private favoritesService: FavoritesService,
    private toastService: ToastService
  ) {}

  ngOnChanges() {
    if (this.product) {
      this.selectedSize = this.product.sizes?.[0] || '';
      this.selectedColor = this.product.colors?.[0] || '';
      this.quantity = 1;
      this.added = false;
    }
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

  toggleFavorite() {
    if (this.favoritesService.isFavorite(this.product.id)) {
      this.favoritesService.removeFavorite(this.product.id);
    } else {
      this.favoritesService.addFavorite(this.product);
      this.toastService.success('Añadido a favoritos');
    }
  }

  isFavorite(): boolean {
    return this.favoritesService.isFavorite(this.product?.id);
  }

  onClose() {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('quick-view-overlay')) {
      this.onClose();
    }
  }
}