import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface VisualSearchResult {
  productId: string;
  name: string;
  price: number;
  image: string;
  category: string;
  score: number;
}

export interface VisualSearchResponse {
  results: VisualSearchResult[];
  message?: string;
}

export interface ChatProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  gender: string;
  images: string[];
  sizes: string[];
  colors: string[];
  discount: number;
}

export interface ChatResponse {
  text: string;
  products: ChatProduct[];
  shouldEscalate?: boolean;
  sessionId: string;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private apiUrl = `${environment.apiUrl}/ai`;

  constructor(private http: HttpClient) {}

  chat(message: string, sessionId: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(
      `${this.apiUrl}/chat`,
      { message, sessionId }
    );
  }

  getRecommendations(viewedProductIds: string[]): Observable<{
    recommendations: { productId: string; score: number }[];
  }> {
    return this.http.post<{ recommendations: { productId: string; score: number }[] }>(
      `${this.apiUrl}/recommendations`,
      { viewedProductIds }
    );
  }

  visualSearch(imageBase64: string): Observable<VisualSearchResponse> {
    return this.http.post<VisualSearchResponse>(
      `${this.apiUrl}/visual-search`,
      { imageBase64 }
    );
  }
}