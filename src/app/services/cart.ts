import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

export type NewCartItem = Omit<CartItem, 'id'>;

export interface CartTotal {
  total: number;
  items: number;
}

const CART_STORAGE_KEY = 'fashion_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$ = this.itemsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadCart();
  }

  private loadCart(): void {
    if (this.authService.isLoggedIn()) {
      this.getCart().subscribe({
        next: (items) => this.itemsSubject.next(items),
        error: () => this.loadFromLocalStorage()
      });
    } else {
      this.loadFromLocalStorage();
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      this.itemsSubject.next(stored ? JSON.parse(stored) : []);
    } catch {
      this.itemsSubject.next([]);
    }
  }

  private saveToLocalStorage(): void {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.itemsSubject.value));
  }

  getCart(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(this.apiUrl);
  }

  getItems(): CartItem[] {
    return this.itemsSubject.value;
  }

  getCartTotal(): Observable<CartTotal> {
    if (this.authService.isLoggedIn()) {
      return this.http.get<CartTotal>(`${this.apiUrl}/total`);
    }
    const total = this.getItems().reduce((sum, i) => sum + i.price * i.quantity, 0);
    return of({ total, items: this.getItems().length });
  }

  addItem(item: NewCartItem): Observable<CartItem> {
    if (this.authService.isLoggedIn()) {
      return this.http.post<CartItem>(`${this.apiUrl}/add`, item).pipe(
        tap(() => this.loadCart())
      );
    } else {
      const currentItems = this.itemsSubject.value;
      const newItem = { ...item, id: Date.now().toString() } as CartItem;
      this.itemsSubject.next([...currentItems, newItem]);
      this.saveToLocalStorage();
      return of(newItem);
    }
  }

  updateQuantity(itemId: string, quantity: number): Observable<CartItem> {
    if (this.authService.isLoggedIn()) {
      return this.http.put<CartItem>(`${this.apiUrl}/update/${itemId}`, { quantity }).pipe(
        tap(() => this.loadCart())
      );
    } else {
      const items = this.itemsSubject.value.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      );
      this.itemsSubject.next(items);
      this.saveToLocalStorage();
      return of(items.find(i => i.id === itemId)!);
    }
  }

  removeItem(itemId: string): Observable<void> {
    if (this.authService.isLoggedIn()) {
      return this.http.delete<void>(`${this.apiUrl}/remove/${itemId}`).pipe(
        tap(() => this.loadCart())
      );
    } else {
      const items = this.itemsSubject.value.filter(item => item.id !== itemId);
      this.itemsSubject.next(items);
      this.saveToLocalStorage();
      return of(undefined);
    }
  }

  clearCart(): Observable<void> {
    if (this.authService.isLoggedIn()) {
      return this.http.delete<void>(`${this.apiUrl}/clear`).pipe(
        tap(() => this.itemsSubject.next([]))
      );
    } else {
      this.itemsSubject.next([]);
      this.saveToLocalStorage();
      return of(undefined);
    }
  }

  clear(): void {
    this.itemsSubject.next([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }

  getTotal(): number {
    return this.getItems().reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  getCount(): number {
    return this.getItems().reduce((sum, i) => sum + i.quantity, 0);
  }
}