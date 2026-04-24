import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart';
import { AuthService } from '../../services/auth';
import { OrdersService, CreateOrderRequest } from '../../services/orders';
import { PaymentsService } from '../../services/payments';
import { ToastService } from '../../services/toast';

interface Shipping {
  name: string;
  email: string;
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

interface ValidationError {
  field: string;
  message: string;
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
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'Colombia'
  };

  orderComplete = false;
  orderNumber = '';

  isProcessing = false;
  validationErrors: ValidationError[] = [];
  securityError = '';
  isOnline = true;
  completedTotal = 0;
  completedPaymentMethod = '';

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private ordersService: OrdersService,
    private paymentsService: PaymentsService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cartService.items$.subscribe(items => {
      this.items = items;
      this.total = this.cartService.getTotal();
      this.calculateTotals();
    });

    this.loadUserData();
    
    window.addEventListener('online', () => this.isOnline = true);
    window.addEventListener('offline', () => this.isOnline = false);
    this.isOnline = navigator.onLine;
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
    try {
      const stored = localStorage.getItem('addresses');
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  onAddressTypeChange() {
    if (this.addressType === 'saved' && this.savedAddresses[this.selectedAddressIndex]) {
      const addr = this.savedAddresses[this.selectedAddressIndex];
      this.shipping.street = addr.street;
      this.shipping.city = addr.city;
      this.shipping.state = addr.state;
      this.shipping.zip = addr.zip;
      this.shipping.country = addr.country;
    }
  }

  calculateTotals() {
    this.shippingCost = this.total >= 150000 ? 0 : 15000;
    this.grandTotal = this.total + this.shippingCost;
  }

  private sanitizeInput(input: string): string {
    if (!input) return '';
    return input.replace(/[<>\"\'\\]/g, '').trim().substring(0, 200);
  }

  private sanitizePhone(phone: string): string {
    return phone.replace(/[^\d+]/g, '').substring(0, 15);
  }

  private sanitizeAddress(address: string): string {
    return address.replace(/[<>'"\\;]/g, '').trim().substring(0, 300);
  }

  validateForm(): boolean {
    this.validationErrors = [];

    if (this.items.length === 0) {
      this.validationErrors.push({ field: 'items', message: 'El carrito está vacío' });
      return false;
    }

    if (this.addressType === 'saved') {
      return this.savedAddresses.length > 0;
    }

    if (!this.shipping.name || this.shipping.name.trim().length < 3) {
      this.validationErrors.push({ field: 'name', message: 'El nombre es obligatorio' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.shipping.email || !emailRegex.test(this.shipping.email)) {
      this.validationErrors.push({ field: 'email', message: 'Correo electrónico inválido' });
    }

    if (!this.shipping.phone || !/^\d{7,15}$/.test(this.shipping.phone.replace(/\D/g, ''))) {
      this.validationErrors.push({ field: 'phone', message: 'Teléfono inválido' });
    }

    if (!this.shipping.street || !this.shipping.street.trim()) {
      this.validationErrors.push({ field: 'street', message: 'La dirección es obligatoria' });
    }

    if (!this.shipping.city || !this.shipping.city.trim()) {
      this.validationErrors.push({ field: 'city', message: 'La ciudad es obligatoria' });
    }

    if (!this.shipping.state || !this.shipping.state.trim()) {
      this.validationErrors.push({ field: 'state', message: 'El departamento es obligatorio' });
    }

    if (!this.shipping.zip || !this.shipping.zip.trim()) {
      this.validationErrors.push({ field: 'zip', message: 'El código postal es obligatorio' });
    }

    return this.validationErrors.length === 0;
  }

  get canPlaceOrder(): boolean {
    if (this.items.length === 0) return false;
    if (this.isProcessing) return false;
    if (!this.isOnline) return false;

    if (this.addressType === 'saved') {
      return this.savedAddresses.length > 0;
    }

    return !!(
      this.shipping.name &&
      this.shipping.email &&
      this.shipping.phone &&
      this.shipping.street &&
      this.shipping.city &&
      this.shipping.state &&
      this.shipping.zip
    );
  }

  getStatusMessage(): string {
    if (!this.isOnline) return 'Sin conexión a internet';
    if (this.isProcessing) return 'Procesando pedido...';
    return '';
  }

  getPaymentLabel(): string {
    switch (this.paymentMethod) {
      case 'cod': return 'Contra entrega';
      case 'transfer': return 'Transferencia bancaria';
      case 'card': return 'Tarjeta débito/crédito';
      default: return '';
    }
  }

  getPaymentLabelComplete(): string {
    switch (this.completedPaymentMethod) {
      case 'cod': return 'Contra entrega';
      case 'transfer': return 'Transferencia bancaria';
      case 'card': return 'Tarjeta débito/crédito';
      default: return '';
    }
  }

  goToOrders() {
    this.router.navigate(['/order-confirmation']);
  }

  async placeOrder() {
    this.securityError = '';
    this.validationErrors = [];

    if (!this.validateForm()) {
      return;
    }

    this.isProcessing = true;

    try {
      const sanitizedShipping = {
        name: this.sanitizeInput(this.shipping.name),
        street: this.sanitizeAddress(this.shipping.street),
        city: this.sanitizeAddress(this.shipping.city),
        state: this.sanitizeAddress(this.shipping.state),
        zip: this.sanitizeInput(this.shipping.zip),
        country: this.shipping.country
      };

      const orderData: CreateOrderRequest = {
        items: this.items.map(item => ({
          productId: item.productId || '',
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
          size: item.size,
          color: item.color,
          image: item.image
        })),
        total: Number(this.grandTotal),
        paymentMethod: this.paymentMethod === 'card' ? 'stripe' : 
                    this.paymentMethod === 'transfer' ? 'mercadopago' : 'cash',
        shippingAddress: sanitizedShipping
      };

      const order = await this.ordersService.createOrder(orderData).toPromise();
      
      if (!order) {
        throw new Error('Error al crear la orden');
      }

      if (this.paymentMethod === 'card' || this.paymentMethod === 'transfer') {
        const paymentMethod = this.paymentMethod === 'card' ? 'stripe' : 'mercadopago';
        
        try {
          if (paymentMethod === 'stripe') {
            const payment = await this.paymentsService.createStripePayment(
              order.id,
              this.grandTotal
            ).toPromise();
            
            if (payment?.url) {
              window.location.href = payment.url;
              return;
            }
            throw new Error('No se pudo crear la sesión de pago');
          } else {
            const payment = await this.paymentsService.createMercadoPagoPayment(
              order.id,
              orderData.items,
              this.shipping.email
            ).toPromise();
            
            if (payment?.initPoint) {
              window.location.href = payment.initPoint;
              return;
            }
            throw new Error('No se pudo crear la preferencia de pago');
          }
        } catch (paymentError: any) {
          console.error('Payment error:', paymentError);
          this.isProcessing = false;
          this.toastService.error('Error al procesar el pago. Por favor intenta de nuevo o elige otro método de pago.');
          return;
        }
      }

      localStorage.setItem('last_order', JSON.stringify({
        id: order.id,
        date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
        total: this.grandTotal
      }));

      this.orderNumber = order.id;
      this.completedTotal = this.grandTotal;
      this.completedPaymentMethod = this.paymentMethod;
      this.orderComplete = true;
      this.cartService.clear();
      this.cdr.detectChanges();

      this.router.navigate(['/order-confirmation'], { queryParams: { orderId: order.id } });

    } catch (error: any) {
      this.securityError = error.error?.message || 'Error al procesar el pedido. Intenta de nuevo.';
    } finally {
      this.isProcessing = false;
    }
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${timestamp}-${random}`;
  }

  getStoredOrders(): any[] {
    try {
      const stored = localStorage.getItem('orders');
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}