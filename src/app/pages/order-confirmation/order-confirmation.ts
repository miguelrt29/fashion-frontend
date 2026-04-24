import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.css'
})
export class OrderConfirmation implements OnInit {
  orderId = '';
  orderDate = '';
  orderTotal = 0;
  customerEmail = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const storedOrder = localStorage.getItem('last_order');
    if (storedOrder) {
      const order = JSON.parse(storedOrder);
      this.orderId = order.id || String(Date.now());
      this.orderDate = order.date || new Date().toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      this.orderTotal = order.total || 0;
      this.customerEmail = order.email || 'cliente@email.com';
    } else {
      this.orderId = String(Date.now()).slice(-6);
      this.orderDate = new Date().toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      this.router.navigate(['/']);
    }
  }

  goToOrders() {
    window.location.href = '/profile?tab=orders';
  }
}