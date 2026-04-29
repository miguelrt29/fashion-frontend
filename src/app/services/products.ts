import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError, timeout } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  gender: string;
  brand: string;
  sizes: string[];
  colors: string[];
  images: string[];
  discount: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private apiUrl = `${environment.apiUrl}/products`;
  private timeoutMs = 10000;

  constructor(private http: HttpClient) {}

  getAll(gender?: string, category?: string, search?: string): Observable<Product[]> {
    let params = new HttpParams();
    if (gender) params = params.append('gender', gender);
    if (category) params = params.append('category', category);
    if (search) params = params.append('search', search);
    return this.http.get<Product[]>(this.apiUrl, { params }).pipe(
      timeout(this.timeoutMs),
      catchError((error) => {
        console.error('Error fetching products:', error);
        return of([]);
      })
    );
  }

  getById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  create(data: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, data);
  }

  update(id: string, data: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
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
}