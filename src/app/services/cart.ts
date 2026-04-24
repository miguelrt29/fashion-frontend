import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

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

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$ = this.itemsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCart();
  }

  private loadCart(): void {
    this.getCart().subscribe({
      next: (items) => this.itemsSubject.next(items),
      error: () => this.itemsSubject.next([])
    });
  }

  getCart(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(this.apiUrl);
  }

  getItems(): CartItem[] {
    return this.itemsSubject.value;
  }

  getCartTotal(): Observable<CartTotal> {
    return this.http.get<CartTotal>(`${this.apiUrl}/total`);
  }

  addItem(item: NewCartItem): Observable<CartItem> {
    return this.http.post<CartItem>(`${this.apiUrl}/add`, item).pipe(
      tap(() => this.loadCart())
    );
  }

  updateQuantity(itemId: string, quantity: number): Observable<CartItem> {
    return this.http.put<CartItem>(`${this.apiUrl}/update/${itemId}`, { quantity }).pipe(
      tap(() => this.loadCart())
    );
  }

  removeItem(itemId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/remove/${itemId}`).pipe(
      tap(() => this.loadCart())
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clear`).pipe(
      tap(() => this.itemsSubject.next([]))
    );
  }

  clear(): void {
    this.itemsSubject.next([]);
    localStorage.removeItem('cart');
  }

  getTotal(): number {
    return this.getItems().reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  getCount(): number {
    return this.getItems().reduce((sum, i) => sum + i.quantity, 0);
  }
}