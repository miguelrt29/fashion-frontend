import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth';

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

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.initFavorites();
    
    this.authService.user$.subscribe(user => {
      if (user) {
        this.loadFavorites();
      } else {
        this.favoritesSubject.next([]);
      }
    });
  }

  private initFavorites(): void {
    if (this.authService.isLoggedIn()) {
      this.loadFavorites();
    }
  }

  private loadFavorites(): void {
    if (!this.authService.isLoggedIn()) {
      this.favoritesSubject.next([]);
      return;
    }
    
    this.getFavorites().pipe(
      catchError(() => of([] as FavoriteItem[]))
    ).subscribe(favs => this.favoritesSubject.next(favs));
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
      tap(() => this.loadFavorites()),
      catchError(err => {
        if (err.status === 409) {
          return of({ ...product, id: '', createdAt: new Date() } as FavoriteItem);
        }
        throw err;
      })
    );
  }

  removeFavorite(favoriteId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/remove/${favoriteId}`).pipe(
      tap(() => this.loadFavorites()),
      catchError(() => of())
    );
  }

  isFavorite(productId: string): boolean {
    return this.favoritesSubject.value.some(f => f.productId === productId);
  }

  getCount(): number {
    return this.favoritesSubject.value.length;
  }
}