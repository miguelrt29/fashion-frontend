import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$ = this.itemsSubject.asObservable();

  constructor() {
    const saved = localStorage.getItem('cart');
    if (saved) this.itemsSubject.next(JSON.parse(saved));
  }

  getItems(): CartItem[] {
    return this.itemsSubject.value;
  }

  addItem(item: CartItem) {
    const items = this.getItems();
    const existing = items.find(i => i.id === item.id && i.size === item.size && i.color === item.color);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      items.push(item);
    }
    this.save(items);
  }

  removeItem(id: string, size: string, color: string) {
    const items = this.getItems().filter(
      i => !(i.id === id && i.size === size && i.color === color)
    );
    this.save(items);
  }

  updateQuantity(id: string, size: string, color: string, quantity: number) {
    const items = this.getItems();
    const item = items.find(i => i.id === id && i.size === size && i.color === color);
    if (item) item.quantity = quantity;
    this.save(items);
  }

  getTotal(): number {
    return this.getItems().reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  getCount(): number {
    return this.getItems().reduce((sum, i) => sum + i.quantity, 0);
  }

  clear() {
    this.save([]);
  }

  private save(items: CartItem[]) {
    this.itemsSubject.next(items);
    localStorage.setItem('cart', JSON.stringify(items));
  }
}