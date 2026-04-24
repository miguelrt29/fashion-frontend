import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ResetToken {
  email: string;
  token: string;
  expiresAt: number;
  used: boolean;
}

@Injectable({ providedIn: 'root' })
export class PasswordResetService {
  private readonly STORAGE_KEY = 'password_reset_tokens';
  private readonly TOKEN_EXPIRY = 3600000;

  private tokensSubject = new BehaviorSubject<ResetToken[]>([]);
  tokens$ = this.tokensSubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const tokens = JSON.parse(stored);
        const validTokens = tokens.filter((t: ResetToken) => t.expiresAt > Date.now() && !t.used);
        this.tokensSubject.next(validTokens);
        this.saveToStorage(validTokens);
      }
    } catch {
      this.tokensSubject.next([]);
    }
  }

  private saveToStorage(tokens: ResetToken[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tokens));
  }

  generateResetToken(email: string): string {
    const token = this.generateSecureToken();
    const resetToken: ResetToken = {
      email: email.toLowerCase(),
      token,
      expiresAt: Date.now() + this.TOKEN_EXPIRY,
      used: false
    };

    const current = this.tokensSubject.value;
    const updated = [...current, resetToken];
    this.tokensSubject.next(updated);
    this.saveToStorage(updated);

    return token;
  }

  validateResetToken(token: string): { valid: boolean; email?: string; error?: string } {
    const tokens = this.tokensSubject.value;
    const resetToken = tokens.find(t => t.token === token);

    if (!resetToken) {
      return { valid: false, error: 'Token inválido' };
    }

    if (resetToken.expiresAt < Date.now()) {
      return { valid: false, error: 'Token expirado' };
    }

    if (resetToken.used) {
      return { valid: false, error: 'Token ya utilizado' };
    }

    return { valid: true, email: resetToken.email };
  }

  markTokenAsUsed(token: string): void {
    const current = this.tokensSubject.value;
    const updated = current.map(t => 
      t.token === token ? { ...t, used: true } : t
    );
    this.tokensSubject.next(updated);
    this.saveToStorage(updated);
  }

  private generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}