import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart';
import { CouponsService } from '../../services/coupons';
import { ToastService } from '../../services/toast';
import { Observable, forkJoin } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit {
  items: CartItem[] = [];
  subtotal = 0;
  discount = 0;
  shipping = 0;
  couponCode = '';
  couponError = '';
  couponSuccess = '';
  appliedCoupon: any = null;
  freeShipping = false;

  constructor(
    private cartService: CartService,
    private couponsService: CouponsService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.items$.subscribe(items => {
      this.items = items;
      this.calculateTotals();
    });
  }

  calculateTotals() {
    this.cartService.getCartTotal().subscribe({
      next: (total) => {
        this.subtotal = total.total; 
        this.shipping = this.subtotal >= 150000 ? 0 : 15000;
        this.freeShipping = this.subtotal >= 150000;
        
        if (this.appliedCoupon) {
          this.discount = this.couponsService.calculateDiscount(this.appliedCoupon, this.subtotal);
        } else {
          this.discount = 0;
        }
      }
    });
  }

  updateQuantity(item: CartItem, quantity: number) {
    if (quantity < 1) return;
    this.cartService.updateQuantity(item.id, quantity).subscribe({
      next: () => this.toastService.success('Cantidad actualizada'),
      error: () => this.toastService.error('Error al actualizar cantidad')
    });
  }

  removeItem(item: CartItem) {
    this.cartService.removeItem(item.id).subscribe({
      next: () => this.toastService.success('Producto eliminado del carrito'),
      error: () => this.toastService.error('Error al eliminar producto')
    });
  }

  clearCart() {
    this.cartService.clearCart().subscribe({
      next: () => this.toastService.success('Carrito vaciado'),
      error: () => this.toastService.error('Error al vaciar carrito')
    });
  }

  applyCoupon() {
    if (!this.couponCode.trim()) {
      this.couponError = 'Ingresa un código de cupón';
      return;
    }

    this.couponsService.validateCoupon(this.couponCode, this.subtotal).subscribe({
      next: (result) => {
        if (!result.valid) {
          this.couponError = result.message || 'Cupón no válido';
          this.couponSuccess = '';
          return;
        }
        this.couponError = '';
        this.couponSuccess = 'Cupón aplicado';
        this.discount = result.discount || 0;
        this.calculateTotals();
        this.toastService.success('Cupón aplicado correctamente');
      },
      error: () => {
        this.couponError = 'Error al validar cupón';
      }
    });
  }

  removeCoupon() {
    this.couponCode = '';
    this.couponError = '';
    this.couponSuccess = '';
    this.appliedCoupon = null;
    this.discount = 0;
    this.calculateTotals();
  }

  getTotal(): number {
    return this.subtotal - this.discount + this.shipping;
  }

  getProgressToFreeShipping(): number {
    if (this.subtotal >= 150000) return 100;
    return (this.subtotal / 150000) * 100;
  }

  getAmountToFreeShipping(): number {
    return Math.max(0, 150000 - this.subtotal);
  }

  goToCheckout() {
    this.router.navigate(['/checkout'], {
      queryParams: { coupon: this.appliedCoupon?.code }
    });
  }
}