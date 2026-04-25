import { Component, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink, Router } from '@angular/router';
import { AiService } from '../../services/ai';
import { CartService, NewCartItem } from '../../services/cart';
import { FavoritesService } from '../../services/favorites';
import { ToastService } from '../../services/toast';

interface ProductCard {
  id: string;
  name: string;
  price: number;
  category: string;
  gender: string;
  images: string[];
  sizes: string[];
  colors: string[];
  discount: number;
}

interface ChatResponse {
  text: string;
  products: ProductCard[];
  shouldEscalate?: boolean;
  sessionId: string;
}

interface Message {
  role: 'user' | 'bot';
  text: string;
  image?: string;
  timestamp: Date;
  isEscalate?: boolean;
  products?: ProductCard[];
}

interface QuickReply {
  icon: string;
  text: string;
  label: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css'
})
export class Chatbot implements OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  isOpen = false;
  message = '';
  messages: Message[] = [];
  loading = false;
  sessionId = this.generateSessionId();
  showImageOptions = false;
  showCamera = false;
  capturedImage: string | null = null;
  isCameraActive = false;
  pendingAddToCart: ProductCard | null = null;
  showSizeSelector = false;
  selectedSize = '';
  selectedColor = '';
  imagePreview = '';

  quickReplies: QuickReply[] = [
    { icon: 'sale', text: 'ofertas', label: 'Ver ofertas' },
    { icon: 'search', text: 'buscar', label: 'Buscar' },
    { icon: 'package', text: 'pedidos', label: 'Mis pedidos' },
    { icon: 'ruler', text: 'tallas', label: 'Guía tallas' },
  ];

  private stream: MediaStream | null = null;

  constructor(
    private aiService: AiService,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    private toastService: ToastService,
    private router: Router
  ) {}

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.messages.length === 0) {
      this.addBotMessage('Hola! Soy tu asistente de FashionStore. Como puedo ayudarte?');
    }
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  }

  addUserMessage(text: string, image?: string) {
    this.messages.push({
      role: 'user',
      text,
      image,
      timestamp: new Date()
    });
    this.scrollToBottom();
  }

  addBotMessage(text: string, options?: { isEscalate?: boolean; products?: ProductCard[] }) {
    this.messages.push({
      role: 'bot',
      text,
      timestamp: new Date(),
      ...options
    });
    this.scrollToBottom();
  }

  sendMessage() {
    if (!this.message.trim() || this.loading) return;
    const text = this.message.trim();
    this.message = '';
    this.addUserMessage(text);
    this.loading = true;

    this.aiService.chat(text, this.sessionId).subscribe({
      next: (res: ChatResponse) => {
        this.loading = false;
        if (res.products && res.products.length > 0) {
          this.addBotMessage(res.text || 'Aqui tienes:', { products: res.products });
        } else {
          this.addBotMessage(res.text);
        }
        if (res.shouldEscalate) {
          this.toastService.info('Un agente te contactara pronto');
        }
      },
      error: () => {
        this.loading = false;
        this.addBotMessage('Lo siento, tube un problema. Intenta de nuevo?');
      }
    });
  }

  onSendClick() {
    if (this.capturedImage) {
      this.searchByImage(this.capturedImage);
      this.clearImage();
    } else if (this.message.trim()) {
      this.sendMessage();
    }
  }

  async startCamera() {
    try {
      this.showCamera = true;
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (this.videoElement?.nativeElement) {
        this.videoElement.nativeElement.srcObject = this.stream;
        this.isCameraActive = true;
      }
    } catch {
      this.toastService.error('No se pudo acceder a la camara');
      this.showCamera = false;
    }
  }

  capturePhoto() {
    if (!this.videoElement?.nativeElement) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement.nativeElement.videoWidth;
    canvas.height = this.videoElement.nativeElement.videoHeight;
    canvas.getContext('2d')?.drawImage(this.videoElement.nativeElement, 0, 0);
    
    this.capturedImage = canvas.toDataURL('image/jpeg', 0.8);
    this.imagePreview = this.capturedImage;
    this.stopCamera();
    this.showCamera = false;
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.isCameraActive = false;
  }

  sendQuick(text: string) {
    this.message = text;
    this.sendMessage();
  }

  clearImage() {
    this.imagePreview = '';
    this.capturedImage = null;
  }

  triggerImageUpload() {
    const input = document.getElementById('imageInput') as HTMLInputElement;
    if (input) input.click();
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.toastService.error('Selecciona una imagen');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview = e.target?.result as string;
      this.capturedImage = this.imagePreview;
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  addToCart(product: ProductCard) {
    const cartItem: NewCartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      size: product.sizes?.[0] || 'Unica',
      color: product.colors?.[0] || 'Unico',
      image: product.images?.[0] || ''
    };

    this.cartService.addItem(cartItem).subscribe({
      next: () => {
        this.toastService.success('Producto anadido al carrito');
      },
      error: () => {
        this.toastService.error('Error al anadir');
      }
    });
  }

  viewProduct(id: string) {
    this.isOpen = false;
    this.router.navigate(['/products', id]);
  }

  addToFavorites(product: ProductCard) {
    this.favoritesService.addFavorite({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
      category: product.category
    }).subscribe({
      next: () => {
        this.toastService.success('Anadido a favoritos');
      },
      error: () => {
        this.toastService.error('Error al anadir');
      }
    });
  }

  requestAddToCart(product: ProductCard) {
    if (product.sizes && product.sizes.length > 1) {
      this.pendingAddToCart = product;
      this.showSizeSelector = true;
    } else {
      this.addToCart(product);
    }
  }

  confirmAddToCart() {
    if (this.pendingAddToCart && this.selectedSize) {
      this.addToCart(this.pendingAddToCart);
      this.cancelSizeSelector();
    }
  }

  cancelSizeSelector() {
    this.pendingAddToCart = null;
    this.showSizeSelector = false;
    this.selectedSize = '';
    this.selectedColor = '';
  }

  addUserMessageWithProducts(text: string, image?: string) {
    this.messages.push({
      role: 'user',
      text,
      image,
      timestamp: new Date()
    });
    this.scrollToBottom();
  }

  searchByImage(base64: string) {
    this.addUserMessageWithProducts('Buscando...', base64);
    this.loading = true;

    this.aiService.visualSearch(base64).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.results.length > 0) {
          const products = res.results.map(r => ({
            id: r.productId,
            name: r.name,
            price: r.price,
            category: r.category,
            gender: '',
            images: r.image ? [r.image] : [],
            sizes: [],
            colors: [],
            discount: 0
          }));
          this.addBotMessage(res.message || 'Encontré estos productos:', { products });
        } else {
          this.addBotMessage('No encontré productos similares.');
        }
      },
      error: () => {
        this.loading = false;
        this.addBotMessage('No pude procesar la imagen.');
      }
    });
  }

  private scrollToBottom() {
    setTimeout(() => {
      const el = document.getElementById('chatMessages');
      if (el) el.scrollTop = el.scrollHeight;
    }, 100);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  ngOnDestroy() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }
}