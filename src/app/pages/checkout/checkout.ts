import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart';
import { AuthService } from '../../services/auth';

interface Shipping {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface SavedAddress {
  type: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {
  items: CartItem[] = [];
  total = 0;
  shippingCost = 15000;
  grandTotal = 0;

  addressType = 'new';
  selectedAddressIndex = 0;
  savedAddresses: SavedAddress[] = [];

  paymentMethod = 'cod';

  shipping: Shipping = {
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'Colombia'
  };

  orderComplete = false;
  orderNumber = '';

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.items$.subscribe(items => {
      this.items = items;
      this.total = this.cartService.getTotal();
      this.calculateTotals();
    });

    this.loadUserData();
  }

  loadUserData() {
    const user = this.authService.getUser();
    if (user) {
      this.savedAddresses = this.getSavedAddresses();

      if (this.savedAddresses.length > 0) {
        this.addressType = 'saved';
      }
    }
  }

  getSavedAddresses(): SavedAddress[] {
    const stored = localStorage.getItem('addresses');
    return stored ? JSON.parse(stored) : [];
  }

  onAddressTypeChange() {
    if (this.addressType === 'saved' && this.selectedAddressIndex >= 0) {
      const addr = this.savedAddresses[this.selectedAddressIndex];
      this.shipping.street = addr.street;
      this.shipping.city = addr.city;
      this.shipping.state = addr.state;
      this.shipping.zip = addr.zip;
      this.shipping.country = addr.country;
    }
  }

  calculateTotals() {
    if (this.total >= 150000) {
      this.shippingCost = 0;
    } else {
      this.shippingCost = 15000;
    }
    this.grandTotal = this.total + this.shippingCost;
  }

  get canPlaceOrder(): boolean {
    if (this.items.length === 0) return false;

    if (this.addressType === 'saved') {
      return this.savedAddresses.length > 0;
    }

    return !!(
      this.shipping.name &&
      this.shipping.phone &&
      this.shipping.street &&
      this.shipping.city &&
      this.shipping.state &&
      this.shipping.zip
    );
  }

  getPaymentLabel(): string {
    switch (this.paymentMethod) {
      case 'cod': return 'Contra entrega';
      case 'transfer': return 'Transferencia bancaria';
      case 'card': return 'Tarjeta débito/crédito';
      default: return '';
    }
  }

  placeOrder() {
    if (!this.canPlaceOrder) return;

    this.orderNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

    const order = {
      id: this.orderNumber,
      date: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
      items: this.items.length,
      total: this.grandTotal,
      status: 'pending' as const,
      statusLabel: 'Pendiente',
      shipping: { ...this.shipping },
      paymentMethod: this.paymentMethod
    };

    const orders = this.getStoredOrders();
    orders.unshift(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    this.orderComplete = true;
    this.cartService.clear();
  }

  getStoredOrders(): any[] {
    const stored = localStorage.getItem('orders');
    return stored ? JSON.parse(stored) : [];
  }
}