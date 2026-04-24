import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SearchHistoryService {
  private readonly STORAGE_KEY = 'search_history';
  private readonly MAX_HISTORY = 10;
  
  private historySubject = new BehaviorSubject<string[]>([]);
  history$ = this.historySubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.historySubject.next(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      this.historySubject.next([]);
    }
  }

  private saveToStorage(items: string[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
  }

  getHistory(): string[] {
    return this.historySubject.value;
  }

  addSearch(term: string): void {
    if (!term || term.trim().length === 0) return;

    const cleanTerm = term.trim().toLowerCase();
    const current = this.historySubject.value;
    
    const filtered = current.filter(item => item.toLowerCase() !== cleanTerm);
    const updated = [cleanTerm, ...filtered].slice(0, this.MAX_HISTORY);
    
    this.historySubject.next(updated);
    this.saveToStorage(updated);
  }

  removeSearch(term: string): void {
    const current = this.historySubject.value;
    const updated = current.filter(item => item.toLowerCase() !== term.toLowerCase());
    this.historySubject.next(updated);
    this.saveToStorage(updated);
  }

  clearHistory(): void {
    this.historySubject.next([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getCount(): number {
    return this.historySubject.value.length;
  }
}