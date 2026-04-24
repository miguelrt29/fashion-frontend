import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrdersService, TrackingResponse } from '../../services/orders';
import { ToastService } from '../../services/toast';

interface OrderTrackingData {
  id: string;
  status: string;
  statusLabel: string;
  estimatedDelivery: string;
  steps: {
    name: string;
    date: string;
    completed: boolean;
    current: boolean;
  }[];
  shipping: {
    name: string;
    street: string;
    city: string;
  };
  trackingNumber?: string;
}

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './order-tracking.html',
  styleUrl: './order-tracking.css'
})
export class OrderTracking implements OnInit {
  orderId = '';
  foundOrder: OrderTrackingData | null = null;
  notFound = false;
  searchInput = '';
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private ordersService: OrdersService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.searchOrder(params['id']);
      }
    });
  }

  searchOrder(id?: string) {
    const searchId = id || this.searchInput.trim();
    if (!searchId) {
      this.toastService.error('Ingresa un ID de pedido');
      return;
    }

    this.loading = true;
    this.ordersService.getTracking(searchId).subscribe({
      next: (tracking: TrackingResponse) => {
        const steps = this.buildSteps(tracking);
        this.foundOrder = {
          id: tracking.orderId,
          status: tracking.status,
          statusLabel: this.getStatusLabel(tracking.status),
          estimatedDelivery: tracking.estimatedDelivery 
            ? new Date(tracking.estimatedDelivery).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
            : 'Calculando...',
          steps,
          shipping: { name: '', street: '', city: '' },
          trackingNumber: tracking.trackingNumber
        };
        this.notFound = false;
        this.loading = false;
      },
      error: () => {
        this.foundOrder = null;
        this.notFound = true;
        this.loading = false;
      }
    });
  }

  private buildSteps(tracking: TrackingResponse): OrderTrackingData['steps'] {
    const allSteps = [
      { name: 'Pedido confirmado', status: 'pending' },
      { name: 'Preparando envío', status: 'confirmed' },
      { name: 'En camino', status: 'shipped' },
      { name: 'Entregado', status: 'delivered' }
    ];

    const currentIndex = allSteps.findIndex(s => s.status === tracking.status);

    return allSteps.map((step, index) => ({
      name: step.name,
      date: index <= currentIndex && tracking.history?.[index]
        ? new Date(tracking.history[index].date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
        : '',
      completed: index < currentIndex,
      current: index === currentIndex
    }));
  }

  private getStatusLabel(status: string): string {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'confirmed': return 'Confirmado';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  }
}