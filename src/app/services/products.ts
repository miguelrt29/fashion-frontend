import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, timeout, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  category: string;
  brand: string;
  images: string[];
  thumbnail: string;
  rating: number;
  stock: number;
  sizes: string[];
  colors: string[];
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private apiUrl = `${environment.apiUrl}/products`;
  private timeoutMs = 10000;

  constructor(private http: HttpClient) {}

  getAll(category?: string, search?: string): Observable<Product[]> {
    let url = this.apiUrl;
    
    const params: string[] = [];
    if (category) params.push(`category=${category}`);
    if (search) params.push(`search=${search}`);
    
    if (params.length > 0) url += '?' + params.join('&');

    return this.http.get<Product[]>(url).pipe(
      timeout(this.timeoutMs),
      catchError((error) => {
        console.error('Error fetching products:', error);
        return of([]);
      })
    );
  }

  getOne(id: string): Observable<Product | null> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      timeout(this.timeoutMs),
      catchError((error) => {
        console.error('Error fetching product:', error);
        return of(null);
      })
    );
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`).pipe(
      timeout(this.timeoutMs),
      catchError(() => of([]))
    );
  }

  create(data: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, data);
  }

  update(id: string, data: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, data);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}