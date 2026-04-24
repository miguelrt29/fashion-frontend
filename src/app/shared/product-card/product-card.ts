import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart';
import { ToastService } from '../../services/toast';
import { FavoritesService } from '../../services/favorites';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css'
})
export class ProductCard implements OnInit {
  @Input() product: any;
  isFavorite = false;

  constructor(
    private cartService: CartService,
    private toastService: ToastService,
    private favoritesService: FavoritesService
  ) {}

  ngOnInit() {
    this.favoritesService.favorites$.subscribe(() => {
      this.isFavorite = this.favoritesService.isFavorite(this.product.id);
    });
  }

  addToCart() {
    this.cartService.addItem({
      productId: this.product.id,
      name: this.product.name,
      price: this.product.price,
      quantity: 1,
      size: this.product.sizes?.[0] || 'M',
      color: this.product.colors?.[0] || 'único',
      image: this.product.images?.[0] || ''
    }).subscribe({
      next: () => this.toastService.success(`${this.product.name} añadido al carrito`),
      error: () => this.toastService.error('Error al añadir al carrito')
    });
  }

  toggleFavorite(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (this.isFavorite) {
      const fav = this.favoritesService.getFavoritesList().find(f => f.productId === this.product.id);
      if (fav) {
        this.favoritesService.removeFavorite(fav.id).subscribe({
          next: () => {
            this.isFavorite = false;
            this.toastService.info(`${this.product.name} eliminado de favoritos`);
          },
          error: () => this.toastService.error('Error al eliminar de favoritos')
        });
      }
    } else {
      this.favoritesService.addFavorite({
        productId: this.product.id,
        name: this.product.name,
        price: this.product.price,
        image: this.product.images?.[0],
        category: this.product.category
      }).subscribe({
        next: () => {
          this.isFavorite = true;
          this.toastService.success(`${this.product.name} añadido a favoritos`);
        },
        error: () => this.toastService.error('Error al añadir a favoritos')
      });
    }
  }
}