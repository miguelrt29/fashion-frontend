import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AiService } from '../../services/ai';
import { ToastService } from '../../services/toast';

interface Message {
  role: 'user' | 'bot';
  text: string;
  image?: string;
  timestamp: Date;
  isEscalate?: boolean;
}

interface QuickReply {
  icon: string;
  text: string;
  message: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css'
})
export class Chatbot {
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
  showAllQuickReplies = false;
  capturedImage: string | null = null;
  isCameraActive = false;

  quickReplies: QuickReply[] = [
    { icon: '📦', text: 'Rastrear pedido', message: '¿Cómo puedo rastrear mi pedido?' },
    { icon: '↩️', text: 'Devoluciones', message: '¿Cuál es la política de devoluciones?' },
    { icon: '🚚', text: 'Envíos', message: '¿Cuánto cuesta el envío?' },
    { icon: '💳', text: 'Métodos de pago', message: '¿Qué métodos de pago aceptan?' },
    { icon: '👗', text: 'Tallas', message: '¿Cómo elijo mi talla?' },
    { icon: '🤖', text: 'Buscar por foto', message: 'Buscar productos similares a una foto' },
  ];

  private stream: MediaStream | null = null;

  constructor(
    private aiService: AiService,
    private toastService: ToastService
  ) {}

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.messages.length === 0) {
      this.addBotMessage('¡Hola! 👋 Soy tu asistente virtual de FashionStore. Estoy aquí para ayudarte con cualquier duda que tengas.');
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

  addBotMessage(text: string, isEscalate = false) {
    let cleanText = text;
    if (isEscalate || text.startsWith('[ESCALAR]')) {
      cleanText = text.replace('[ESCALAR]', '').trim();
      this.messages.push({
        role: 'bot',
        text: cleanText,
        timestamp: new Date(),
        isEscalate: true
      });
    } else {
      this.messages.push({
        role: 'bot',
        text: cleanText,
        timestamp: new Date()
      });
    }
    this.scrollToBottom();
  }

  sendMessage() {
    if (!this.message.trim() || this.loading) return;
    const text = this.message.trim();
    this.message = '';
    this.addUserMessage(text);
    this.loading = true;

    this.aiService.chat(text, this.sessionId).subscribe({
      next: (res) => {
        this.loading = false;
        this.addBotMessage(res.reply, res.shouldEscalate);
        if (res.shouldEscalate) {
          this.toastService.info('Un agente humano se pondrá en contacto contigo pronto');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.addBotMessage('Lo siento, estoy teniendo problemas para responder. ¿Podrías intentar de nuevo? 🙏');
      }
    });
  }

  sendQuickReply(quickReply: QuickReply) {
    if (quickReply.message === 'Buscar productos similares a una foto') {
      this.showImageOptions = true;
      return;
    }
    this.message = quickReply.message;
    this.sendMessage();
  }

  toggleImageOptions() {
    this.showImageOptions = !this.showImageOptions;
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  triggerCamera() {
    this.showCamera = true;
    setTimeout(() => this.startCamera(), 100);
  }

  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (this.videoElement?.nativeElement) {
        this.videoElement.nativeElement.srcObject = this.stream;
        this.isCameraActive = true;
      }
    } catch (err) {
      this.toastService.error('No se pudo acceder a la cámara');
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
    this.stopCamera();
    this.showCamera = false;
    this.showImageOptions = false;
    
    this.searchByImage(this.capturedImage);
  }

  cancelCamera() {
    this.stopCamera();
    this.showCamera = false;
    this.capturedImage = null;
  }

  private stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.isCameraActive = false;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.toastService.error('Por favor selecciona una imagen');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      this.showImageOptions = false;
      this.searchByImage(base64);
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  private searchByImage(base64: string) {
    this.addUserMessage('Buscando productos similares...', base64);
    this.loading = true;

    this.aiService.visualSearch(base64).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.results.length > 0) {
          const resultCount = res.results.length;
          this.addBotMessage(`Encontré ${resultCount} productos similares para ti. Los resultados más relevantes son:`);
        } else {
          this.addBotMessage('No encontré productos similares a esa imagen. ¿Podrías intentar con otra foto?');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.addBotMessage('Lo siento, no pude procesar la imagen. ¿Podrías intentar de nuevo?');
      }
    });
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.messagesContainer?.nativeElement) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 50);
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  ngOnDestroy() {
    this.stopCamera();
  }
}