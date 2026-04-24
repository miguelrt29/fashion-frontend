import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface RecentlyViewedItem {
  id: number;
  title: string;
  price: number;
  image: string;
  category: string;
  viewedAt: number;
}

@Injectable({ providedIn: 'root' })
export class RecentlyViewedService {
  private readonly STORAGE_KEY = 'recently_viewed';
  private readonly MAX_ITEMS = 10;
  
  private itemsSubject = new BehaviorSubject<RecentlyViewedItem[]>([]);
  items$ = this.itemsSubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.itemsSubject.next(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      this.itemsSubject.next([]);
    }
  }

  private saveToStorage(items: RecentlyViewedItem[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    this.itemsSubject.next(items);
  }

  getItems(): RecentlyViewedItem[] {
    return this.itemsSubject.value;
  }

  addItem(product: any): void {
    const items = this.getItems();
    const existingIndex = items.findIndex(item => item.id === product.id);
    
    if (existingIndex !== -1) {
      items.splice(existingIndex, 1);
    }

    const newItem: RecentlyViewedItem = {
      id: product.id,
      title: product.name || product.title,
      price: product.price,
      image: product.images?.[0] || product.thumbnail || '',
      category: product.category || '',
      viewedAt: Date.now()
    };

    const updated = [newItem, ...items].slice(0, this.MAX_ITEMS);
    this.saveToStorage(updated);
  }

  removeItem(productId: number): void {
    const items = this.getItems().filter(item => item.id !== productId);
    this.saveToStorage(items);
  }

  clearAll(): void {
    this.saveToStorage([]);
  }

  getCount(): number {
    return this.itemsSubject.value.length;
  }
}