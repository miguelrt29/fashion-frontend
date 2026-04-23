import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private apiUrl = 'https://fakestoreapi.com';

  constructor(private http: HttpClient) {}

  getAll(category?: string, search?: string): Observable<any[]> {
    let url = `${this.apiUrl}/products`;

    if (category && category !== '') {
      url = `${this.apiUrl}/products/category/${category}`;
    }

    if (search) {
      return this.http.get<any[]>(url).pipe(
        map(products => this.searchProducts(products, search))
      );
    }

    return this.http.get<any[]>(url).pipe(
      map(products => this.mapProducts(products))
    );
  }

  private searchProducts(products: any[], search: string): any[] {
    const filtered = products.filter(p => 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    );
    return this.mapProducts(filtered);
  }

  getOne(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/products/${id}`).pipe(
      map(product => this.mapProductDetail(product))
    );
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/products/categories`);
  }

  private mapProducts(products: any[]): any[] {
    return products.map(p => ({
      id: p.id,
      name: this.cleanProductName(p.title),
      price: Math.round(p.price * 4000),
      discount: 0,
      category: this.getCategoryLabel(p.category),
      brand: 'FashionStore',
      images: [p.image],
      thumbnail: p.image,
      rating: p.rating?.rate || 4.5,
      stock: 10,
      description: p.description,
      originalCategory: p.category
    }));
  }

  private mapProductDetail(product: any): any {
    return {
      id: product.id,
      name: this.cleanProductName(product.title),
      price: Math.round(product.price * 4000),
      discount: 0,
      category: this.getCategoryLabel(product.category),
      brand: 'FashionStore',
      images: [product.image],
      thumbnail: product.image,
      rating: product.rating?.rate || 4.5,
      stock: 10,
      description: product.description,
      originalCategory: product.category,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Negro', 'Blanco', 'Gris', 'Azul']
    };
  }

  private getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      "men's clothing": "Hombre",
      "women's clothing": "Mujer",
      "jewelery": "Joyería",
      "electronics": "Electrónicos"
    };
    return labels[category] || category;
  }

  private cleanProductName(title: string): string {
    return title
      .replace(/%/g, '')
      .replace(/  /g, ' ')
      .substring(0, 50);
  }

  create(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/products`, data);
  }

  update(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/products/${id}`, data);
  }

  remove(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/products/${id}`);
  }
}