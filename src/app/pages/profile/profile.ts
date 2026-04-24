import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { UsersService, UserProfile, Address } from '../../services/users';
import { OrdersService, Order } from '../../services/orders';
import { ToastService } from '../../services/toast';
import { filter, Subscription } from 'rxjs';

interface LocalOrder {
  id: string;
  date: string;
  items: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  statusLabel: string;
  shipping: string;
  paymentMethod: string;
  orderItems?: any[];
  createdAt?: Date;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit, OnDestroy {
  activeTab = 'profile';
  editing = false;
  editingAddress: string | number | null = null;
  user: UserProfile | null = null;
  editData = { firstName: '', lastName: '', phone: '', email: '' };
  editAddressData: {
    label: string;
    type?: string;
    street: string;
    city: string;
    state: string;
    zip?: string;
    postalCode: string;
    country: string;
    apartment?: string;
    phone?: string;
    isDefault: boolean;
  } = { 
    label: '', 
    type: 'Casa',
    street: '', 
    city: '', 
    state: '', 
    zip: '', 
    postalCode: '', 
    country: 'Colombia',
    phone: '',
    isDefault: false 
  };

  showPasswordModal = false;
  passwordData = { current: '', new: '', confirm: '' };
  passwordLoading = false;

  selectedOrder: Order | null = null;
  selectedLocalOrder: LocalOrder | null = null;

  private routeSub: Subscription | null = null;

  orders: LocalOrder[] = [];
  ordersLoading = false;
  orderDetailLoading = false;

  addresses: Address[] = [];

  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private ordersService: OrdersService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadProfile();
    this.loadAddresses();
    this.loadOrders();
    this.detectTabFromUrl();

    this.routeSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.detectTabFromUrl();
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  detectTabFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'orders' || tab === 'addresses' || tab === 'profile') {
      this.activeTab = tab;
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.router.navigate([], {
      queryParams: { tab: tab },
      queryParamsHandling: 'merge'
    });
  }

  loadProfile() {
    this.usersService.getProfile().subscribe({
      next: (profile) => this.user = profile,
      error: () => {
        this.user = this.authService.getUser();
      }
    });
  }

  loadAddresses() {
    this.usersService.getAddresses().subscribe({
      next: (addresses) => this.addresses = addresses,
      error: () => {}
    });
  }

  startEdit() {
    this.editing = true;
    this.editData = {
      firstName: this.user?.firstName || '',
      lastName: this.user?.lastName || '',
      phone: this.user?.phone || '',
      email: this.user?.email || ''
    };
  }

  cancelEdit() {
    this.editing = false;
    this.editData = { firstName: '', lastName: '', phone: '', email: '' };
  }

  saveProfile() {
    this.usersService.updateProfile(this.editData).subscribe({
      next: (updated) => {
        this.user = updated;
        this.editing = false;
        localStorage.setItem('user', JSON.stringify(updated));
        this.toastService.success('Perfil actualizado');
      },
      error: () => this.toastService.error('Error al actualizar perfil')
    });
  }

  logout() {
    this.authService.logout();
  }

  addAddress() {
    this.editingAddress = null;
    this.editAddressData = {
      label: 'Nueva Dirección',
      type: 'Casa',
      street: '',
      city: '',
      state: '',
      zip: '',
      postalCode: '',
      country: 'Colombia',
      phone: '',
      isDefault: this.addresses.length === 0
    };
  }

  editAddress(address: Address) {
    this.editingAddress = address.id;
    this.editAddressData = { ...address };
  }

  saveAddress() {
    const addressId = typeof this.editingAddress === 'string' ? this.editingAddress : null;
    
    const addressData = {
      label: this.editAddressData.label || this.editAddressData.type || 'Dirección',
      street: this.editAddressData.street,
      city: this.editAddressData.city,
      state: this.editAddressData.state,
      postalCode: this.editAddressData.postalCode || this.editAddressData.zip || '',
      country: this.editAddressData.country,
      apartment: this.editAddressData.apartment,
      phone: this.editAddressData.phone,
      isDefault: this.editAddressData.isDefault,
    };

    if (addressId) {
      this.usersService.updateAddress(addressId, addressData).subscribe({
        next: () => {
          this.loadAddresses();
          this.toastService.success('Dirección actualizada');
          this.cancelEditAddress();
        },
        error: () => this.toastService.error('Error al actualizar dirección')
      });
    } else {
      this.usersService.addAddress(addressData).subscribe({
        next: () => {
          this.loadAddresses();
          this.toastService.success('Dirección añadida');
          this.cancelEditAddress();
        },
        error: () => this.toastService.error('Error al añadir dirección')
      });
    }
  }

  cancelEditAddress() {
    this.editingAddress = null;
    this.editAddressData = { 
      label: '', 
      type: 'Casa',
      street: '', 
      city: '', 
      state: '', 
      zip: '', 
      postalCode: '', 
      country: 'Colombia',
      phone: '',
      isDefault: false 
    };
  }

  deleteAddress(addressId: string) {
    this.usersService.deleteAddress(addressId).subscribe({
      next: () => {
        this.loadAddresses();
        this.toastService.success('Dirección eliminada');
      },
      error: () => this.toastService.error('Error al eliminar dirección')
    });
  }

  openPasswordModal() {
    this.showPasswordModal = true;
    this.passwordData = { current: '', new: '', confirm: '' };
  }

  closePasswordModal() {
    this.showPasswordModal = false;
    this.passwordData = { current: '', new: '', confirm: '' };
  }

  changePassword() {
    if (!this.passwordData.current) {
      this.toastService.error('Ingresa tu contraseña actual');
      return;
    }

    if (this.passwordData.new.length < 6) {
      this.toastService.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (this.passwordData.new !== this.passwordData.confirm) {
      this.toastService.error('Las contraseñas no coinciden');
      return;
    }

    this.passwordLoading = true;

    this.usersService.changePassword({
      currentPassword: this.passwordData.current,
      newPassword: this.passwordData.new
    }).subscribe({
      next: () => {
        this.passwordLoading = false;
        this.toastService.success('Contraseña cambiada correctamente');
        this.closePasswordModal();
      },
      error: (err) => {
        this.passwordLoading = false;
        this.toastService.error(err.error?.message || 'Error al cambiar contraseña');
      }
    });
  }

  getPasswordStrength(): { level: string; color: string; width: string } {
    const pwd = this.passwordData.new;
    if (!pwd) return { level: '', color: '#e4e4e7', width: '0%' };
    
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.match(/[a-z]/) && pwd.match(/[A-Z]/)) strength++;
    if (pwd.match(/[0-9]/)) strength++;
    if (pwd.match(/[^a-zA-Z0-9]/)) strength++;

    switch (strength) {
      case 1: return { level: 'Débil', color: '#ef4444', width: '25%' };
      case 2: return { level: 'Regular', color: '#f59e0b', width: '50%' };
      case 3: return { level: 'Buena', color: '#22c55e', width: '75%' };
      case 4: return { level: 'Fuerte', color: '#059669', width: '100%' };
      default: return { level: '', color: '#e4e4e7', width: '0%' };
    }
  }

  getStatusColor(status: string | undefined): string {
    switch (status) {
      case 'delivered': return '#059669';
      case 'shipped': return '#2563eb';
      case 'confirmed': return '#d97706';
      case 'pending': return '#737373';
      case 'cancelled': return '#dc2626';
      default: return '#737373';
    }
  }

  get userInitials(): string {
    const first = this.user?.firstName?.[0] || 'U';
    const last = this.user?.lastName?.[0] || '';
    return (first + last).toUpperCase();
  }

  viewOrderDetails(order: LocalOrder) {
    this.selectedLocalOrder = order;
    this.orderDetailLoading = true;
    this.ordersService.getOrder(order.id).subscribe({
      next: (fullOrder) => {
        this.selectedOrder = fullOrder;
        this.orderDetailLoading = false;
      },
      error: () => {
        this.orderDetailLoading = false;
        this.selectedOrder = null;
      }
    });
  }

  closeOrderDetails() {
    this.selectedOrder = null;
    this.selectedLocalOrder = null;
  }

  getPaymentLabel(method: string | undefined): string {
    switch (method) {
      case 'stripe': return 'Tarjeta de crédito/débito';
      case 'mercadopago': return 'MercadoPago';
      case 'cash': return 'Contra entrega';
      default: return method || 'No especificado';
    }
  }

  async cancelOrder(orderId: string) {
    if (!confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
      return;
    }

    this.orderDetailLoading = true;
    this.ordersService.cancelOrder(orderId).subscribe({
      next: () => {
        this.toastService.success('Pedido cancelado correctamente');
        this.loadOrders();
        this.closeOrderDetails();
      },
      error: (err) => {
        this.orderDetailLoading = false;
        this.toastService.error(err.error?.message || 'Error al cancelar el pedido');
      }
    });
  }

  private loadOrders() {
    this.ordersLoading = true;
    this.ordersService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders = orders.map(o => ({
          id: o.id,
          date: new Date(o.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
          items: o.items.length,
          total: Number(o.total),
          status: o.status,
          statusLabel: this.getStatusLabel(o.status),
          shipping: typeof o.shippingAddress === 'object' ? o.shippingAddress?.street : '',
          paymentMethod: o.paymentMethod,
          orderItems: o.items
        }));
        this.ordersLoading = false;
      },
      error: () => {
        this.ordersLoading = false;
      }
    });
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