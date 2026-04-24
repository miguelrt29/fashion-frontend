import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AiService {
  private apiUrl = `${environment.apiUrl}/ai`;

  constructor(private http: HttpClient) {}

  chat(message: string, sessionId: string): Observable<{
    reply: string;
    shouldEscalate: boolean;
    sessionId: string;
  }> {
    return this.http.post<{ reply: string; shouldEscalate: boolean; sessionId: string }>(
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

  visualSearch(imageBase64: string, textFilter?: string): Observable<{
    results: { productId: string; score: number; imageUrl: string }[];
  }> {
    return this.http.post<{ results: { productId: string; score: number; imageUrl: string }[] }>(
      `${this.apiUrl}/visual-search`,
      { imageBase64, textFilter }
    );
  }
}