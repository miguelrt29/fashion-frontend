import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoritesService, FavoriteItem } from '../../services/favorites';
import { CartService } from '../../services/cart';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css'
})
export class Favorites implements OnInit {
  favorites: FavoriteItem[] = [];
  isGridView = true;

  constructor(
    private favoritesService: FavoritesService,
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.favoritesService.favorites$.subscribe(items => {
      this.favorites = items;
    });
  }

  removeFavorite(productId: string) {
    const fav = this.favorites.find(f => f.productId === productId);
    if (fav) {
      this.favoritesService.removeFavorite(fav.id).subscribe({
        next: () => this.toastService.info('Eliminado de favoritos'),
        error: () => this.toastService.error('Error al eliminar')
      });
    }
  }

  addToCart(item: FavoriteItem) {
    this.cartService.addItem({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: 1,
      size: 'M',
      color: 'único',
      image: item.image
    }).subscribe({
      next: () => this.toastService.success(`${item.name} añadido al carrito`),
      error: () => this.toastService.error('Error al añadir al carrito')
    });
  }

  clearAll() {
    this.favorites.forEach(fav => {
      this.favoritesService.removeFavorite(fav.id).subscribe();
    });
    this.toastService.info('Todos los favoritos eliminados');
  }

  formatPrice(price: number): string {
    return `$${price.toLocaleString('es-CO')}`;
  }
}