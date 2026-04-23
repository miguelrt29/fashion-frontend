import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css'
})
export class ProductCard {
  @Input() product: any;

  constructor(private cartService: CartService) {}

  addToCart() {
    this.cartService.addItem({
      id: this.product.id,
      name: this.product.name,
      price: this.product.price,
      quantity: 1,
      size: this.product.sizes?.[0] || 'M',
      color: this.product.colors?.[0] || 'único',
      image: this.product.images?.[0] || ''
    });
  }
}