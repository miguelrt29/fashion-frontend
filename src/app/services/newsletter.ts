import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  isActive: boolean;
  subscribedAt: Date;
}

@Injectable({ providedIn: 'root' })
export class NewsletterService {
  private apiUrl = `${environment.apiUrl}/newsletter`;

  constructor(private http: HttpClient) {}

  subscribe(email: string): Observable<NewsletterSubscriber> {
    return this.http.post<NewsletterSubscriber>(`${this.apiUrl}/subscribe`, { email });
  }

  unsubscribe(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/unsubscribe`, { email });
  }

  checkSubscription(email: string): Observable<{ subscribed: boolean }> {
    return this.http.get<{ subscribed: boolean }>(`${this.apiUrl}/check/${email}`);
  }

  getSubscribers(): Observable<NewsletterSubscriber[]> {
    return this.http.get<NewsletterSubscriber[]>(`${this.apiUrl}/subscribers`);
  }

  getSubscribersCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/count`);
  }
}