import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../services/ai';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css'
})
export class Chatbot {
  isOpen = false;
  message = '';
  messages: Message[] = [
    { role: 'bot', text: '¡Hola! Soy tu asistente de FashionStore. ¿En qué puedo ayudarte hoy?' }
  ];
  loading = false;

  constructor(private aiService: AiService) {}

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (!this.message.trim() || this.loading) return;
    const userMsg = this.message.trim();
    this.messages.push({ role: 'user', text: userMsg });
    this.message = '';
    this.loading = true;

    this.aiService.chat(userMsg).subscribe({
      next: (res) => {
        this.messages.push({ role: 'bot', text: res.response });
        this.loading = false;
      },
      error: () => {
        this.messages.push({ role: 'bot', text: 'Lo siento, hubo un error. Intenta de nuevo.' });
        this.loading = false;
      }
    });
  }
}