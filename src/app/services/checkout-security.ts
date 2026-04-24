import { Injectable } from '@angular/core';
import { BehaviorSubject, timer, firstValueFrom } from 'rxjs';

export interface SecurityState {
  isProcessing: boolean;
  isOnline: boolean;
  lastAttempt: number | null;
  attemptCount: number;
  blockedUntil: number | null;
}

@Injectable({ providedIn: 'root' })
export class CheckoutSecurityService {
  private readonly RATE_LIMIT_WINDOW = 60000;
  private readonly RATE_LIMIT_MAX_ATTEMPTS = 3;
  private readonly IDEMPOTENCY_KEY_PREFIX = 'checkout_idempotency_';
  private readonly SESSION_TOKEN_KEY = 'checkout_session';
  private readonly BLOCK_DURATION = 300000;

  private stateSubject = new BehaviorSubject<SecurityState>({
    isProcessing: false,
    isOnline: navigator.onLine,
    lastAttempt: null,
    attemptCount: 0,
    blockedUntil: null
  });

  state$ = this.stateSubject.asObservable();

  constructor() {
    this.setupNetworkListeners();
    this.initializeSession();
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => this.updateState({ isOnline: true }));
    window.addEventListener('offline', () => this.updateState({ isOnline: false }));
  }

  private initializeSession(): void {
    let session = sessionStorage.getItem(this.SESSION_TOKEN_KEY);
    if (!session) {
      session = this.generateSessionToken();
      sessionStorage.setItem(this.SESSION_TOKEN_KEY, session);
    }
  }

  generateSessionToken(): string {
    return `${Date.now()}-${this.generateSecureId()}`;
  }

  private generateSecureId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private updateState(partial: Partial<SecurityState>): void {
    this.stateSubject.next({ ...this.stateSubject.value, ...partial });
  }

  sanitizeInput(input: string): string {
    if (!input) return '';
    return input
      .replace(/[<>\"\'\\]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim()
      .substring(0, 200);
  }

  sanitizePhone(phone: string): string {
    return phone.replace(/[^\d+]/g, '').substring(0, 15);
  }

  sanitizeAddress(address: string): string {
    return address
      .replace(/[<>'"\\;]/g, '')
      .replace(/(\b)(select|insert|update|delete|drop|exec|execute|script)/gi, '')
      .trim()
      .substring(0, 300);
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  validatePhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 7 && cleanPhone.length <= 15;
  }

  validateRequired(value: string | undefined | null): boolean {
    return !!value && value.trim().length > 0;
  }

  generateIdempotencyKey(): string {
    const key = `${this.IDEMPOTENCY_KEY_PREFIX}${Date.now()}-${this.generateSecureId()}`;
    return key;
  }

  checkIdempotency(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  setIdempotencyProcessed(key: string): void {
    localStorage.setItem(key, JSON.stringify({
      timestamp: Date.now(),
      status: 'processing'
    }));
  }

  clearIdempotency(key: string): void {
    localStorage.removeItem(key);
  }

  isRateLimited(): boolean {
    const state = this.stateSubject.value;
    
    if (state.blockedUntil && Date.now() < state.blockedUntil) {
      return true;
    }

    if (state.lastAttempt) {
      const timeSinceLastAttempt = Date.now() - state.lastAttempt;
      if (timeSinceLastAttempt > this.RATE_LIMIT_WINDOW) {
        this.updateState({ attemptCount: 0, lastAttempt: null });
        return false;
      }
    }

    return state.attemptCount >= this.RATE_LIMIT_MAX_ATTEMPTS;
  }

  recordAttempt(): void {
    const state = this.stateSubject.value;
    const newCount = state.attemptCount + 1;
    
    if (newCount >= this.RATE_LIMIT_MAX_ATTEMPTS) {
      this.updateState({
        attemptCount: newCount,
        lastAttempt: Date.now(),
        blockedUntil: Date.now() + this.BLOCK_DURATION
      });
    } else {
      this.updateState({
        attemptCount: newCount,
        lastAttempt: Date.now()
      });
    }
  }

  resetRateLimit(): void {
    this.updateState({
      attemptCount: 0,
      lastAttempt: null,
      blockedUntil: null
    });
  }

  getRateLimitRemaining(): number {
    const state = this.stateSubject.value;
    return Math.max(0, this.RATE_LIMIT_MAX_ATTEMPTS - state.attemptCount);
  }

  getBlockTimeRemaining(): number {
    const state = this.stateSubject.value;
    if (!state.blockedUntil) return 0;
    return Math.max(0, Math.ceil((state.blockedUntil - Date.now()) / 1000));
  }

  setProcessing(isProcessing: boolean): void {
    this.updateState({ isProcessing });
  }

  async safeExecute<T>(
    operation: () => Promise<T>,
    idempotencyKey: string
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    
    if (!navigator.onLine) {
      return { success: false, error: 'Sin conexión a internet. Por favor verifica tu red.' };
    }

    if (this.isRateLimited()) {
      const remaining = this.getBlockTimeRemaining();
      return { 
        success: false, 
        error: `Demasiados intentos. Espera ${Math.ceil(remaining / 60)} minutos.` 
      };
    }

    if (this.checkIdempotency(idempotencyKey)) {
      return { success: false, error: 'Esta operación ya está siendo procesada.' };
    }

    this.setProcessing(true);
    this.setIdempotencyProcessed(idempotencyKey);
    this.recordAttempt();

    try {
      const data = await operation();
      this.setProcessing(false);
      return { success: true, data };
    } catch (error: any) {
      this.clearIdempotency(idempotencyKey);
      this.setProcessing(false);
      
      if (error.name === 'AbortError' || error.message?.includes('network')) {
        return { 
          success: false, 
          error: 'Error de conexión. Tu pedido NO fue procesado. Por favor intenta de nuevo.' 
        };
      }
      
      return { 
        success: false, 
        error: error.message || 'Error al procesar el pedido. Intenta de nuevo.' 
      };
    }
  }

  encryptSensitiveData(data: string): string {
    try {
      const encoded = btoa(unescape(encodeURIComponent(data)));
      return encoded;
    } catch {
      return data;
    }
  }

  decryptSensitiveData(encrypted: string): string {
    try {
      return decodeURIComponent(escape(atob(encrypted)));
    } catch {
      return encrypted;
    }
  }

  storeSensitiveLocally(key: string, data: any): void {
    const encrypted = this.encryptSensitiveData(JSON.stringify(data));
    localStorage.setItem(key, encrypted);
  }

  getSensitiveLocally<T>(key: string): T | null {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    
    try {
      const decrypted = this.decryptSensitiveData(encrypted);
      return JSON.parse(decrypted);
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  }

  clearSensitiveData(key: string): void {
    localStorage.removeItem(key);
  }

  validateOrderIntegrity(items: any[], total: number, expectedTotal: number): boolean {
    if (items.length === 0) return false;
    
    const calculatedTotal = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    return calculatedTotal === expectedTotal && total === expectedTotal;
  }

  generateOrderHash(items: any[], total: number): string {
    const data = JSON.stringify({ items, total, timestamp: Date.now() });
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  getSessionToken(): string {
    return sessionStorage.getItem(this.SESSION_TOKEN_KEY) || '';
  }
}