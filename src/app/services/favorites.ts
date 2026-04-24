import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FavoriteItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  category: string;
  createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private apiUrl = `${environment.apiUrl}/favorites`;
  private favoritesSubject = new BehaviorSubject<FavoriteItem[]>([]);
  favorites$ = this.favoritesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFavorites();
  }

  private loadFavorites(): void {
    this.getFavorites().subscribe({
      next: (favs) => this.favoritesSubject.next(favs),
      error: () => this.favoritesSubject.next([])
    });
  }

  getFavorites(): Observable<FavoriteItem[]> {
    return this.http.get<FavoriteItem[]>(this.apiUrl);
  }

  getFavoritesList(): FavoriteItem[] {
    return this.favoritesSubject.value;
  }

  getFavoritesCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/count`);
  }

  checkIsFavorite(productId: string): Observable<{ isFavorite: boolean }> {
    return this.http.get<{ isFavorite: boolean }>(`${this.apiUrl}/check/${productId}`);
  }

  addFavorite(product: {
    productId: string;
    name?: string;
    price?: number;
    image?: string;
    category?: string;
  }): Observable<FavoriteItem> {
    return this.http.post<FavoriteItem>(`${this.apiUrl}/add`, product).pipe(
      tap(() => this.loadFavorites())
    );
  }

  removeFavorite(favoriteId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/remove/${favoriteId}`).pipe(
      tap(() => this.loadFavorites())
    );
  }

  isFavorite(productId: string): boolean {
    return this.favoritesSubject.value.some(f => f.productId === productId);
  }

  getCount(): number {
    return this.favoritesSubject.value.length;
  }
}