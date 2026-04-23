import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AiService {
  private apiUrl = `${environment.apiUrl}/ai`;

  constructor(private http: HttpClient) {}

  chat(message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/chat`, { message });
  }

  recommend(description: string, products: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/recommend`, { description, products });
  }

  searchByText(query: string, products: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/search`, { query, products });
  }
}