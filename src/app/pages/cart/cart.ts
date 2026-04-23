import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit {
  items: CartItem[] = [];
  total = 0;

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartService.items$.subscribe(items => {
      this.items = items;
      this.total = this.cartService.getTotal();
    });
  }

  updateQuantity(item: CartItem, quantity: number) {
    if (quantity < 1) return;
    this.cartService.updateQuantity(item.id, item.size, item.color, quantity);
  }

  removeItem(item: CartItem) {
    this.cartService.removeItem(item.id, item.size, item.color);
  }

  clearCart() {
    this.cartService.clear();
  }
}