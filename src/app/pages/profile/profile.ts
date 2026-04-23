import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

interface Order {
  id: string;
  date: string;
  items: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  statusLabel: string;
}

interface Address {
  type: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  activeTab = 'profile';
  editing = false;
  editingAddress = -1;
  user: any = {};
  editData: any = {};
  editAddressData: any = {};

  orders: Order[] = [
    {
      id: '2847',
      date: '15 abr 2026',
      items: 2,
      total: 189900,
      status: 'delivered',
      statusLabel: 'Entregado'
    },
    {
      id: '2731',
      date: '02 mar 2026',
      items: 1,
      total: 79900,
      status: 'delivered',
      statusLabel: 'Entregado'
    },
  ];

  addresses: Address[] = [
    {
      type: 'Casa',
      street: 'Calle 123 #45-67, Apartamento 301',
      city: 'Bogotá',
      state: 'Cundinamarca',
      zip: '110111',
      country: 'Colombia'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.authService.getUser() || {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@email.com',
      phone: '3001234567'
    };
    this.loadOrders();
  }

  loadOrders() {
    const stored = localStorage.getItem('orders');
    this.orders = stored ? JSON.parse(stored) : this.orders;
  }

  get userInitials(): string {
    const first = this.user.firstName?.[0] || 'U';
    const last = this.user.lastName?.[0] || '';
    return (first + last).toUpperCase();
  }

  startEdit() {
    this.editing = true;
    this.editData = { ...this.user };
  }

  cancelEdit() {
    this.editing = false;
    this.editData = {};
  }

  saveProfile() {
    this.user = { ...this.editData };
    localStorage.setItem('user', JSON.stringify(this.user));
    this.editing = false;
  }

  logout() {
    this.authService.logout();
  }

  addAddress() {
    const newAddress: Address = {
      type: 'Nueva',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'Colombia'
    };
    this.addresses.push(newAddress);
  }

  editAddress(index: number) {
    this.editingAddress = index;
    this.editAddressData = { ...this.addresses[index] };
  }

  saveAddress() {
    if (this.editingAddress >= 0) {
      this.addresses[this.editingAddress] = { ...this.editAddressData };
    } else {
      this.addresses.push({ ...this.editAddressData });
    }
    this.editingAddress = -1;
    this.editAddressData = {};
  }

  cancelEditAddress() {
    this.editingAddress = -1;
    this.editAddressData = {};
    this.addresses = this.addresses.filter((a: Address) => a.street);
  }

  deleteAddress(index: number) {
    this.addresses.splice(index, 1);
  }
}