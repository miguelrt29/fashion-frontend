import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { OrderItem } from './orders';

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  createStripePayment(orderId: string, amount: number): Observable<{ sessionId: string; url: string }> {
    return this.http.post<{ sessionId: string; url: string }>(`${this.apiUrl}/stripe/create`, {
      orderId,
      amount,
    });
  }

  createMercadoPagoPayment(
    orderId: string,
    items: OrderItem[],
    customerEmail: string,
  ): Observable<{ preferenceId: string; initPoint: string }> {
    return this.http.post<{ preferenceId: string; initPoint: string }>(
      `${this.apiUrl}/mercadopago/create`,
      {
        orderId,
        items,
        customerEmail,
      },
    );
  }

  getPaymentStatus(paymentId: string): Observable<{ paymentId: string; status: string }> {
    return this.http.get<{ paymentId: string; status: string }>(`${this.apiUrl}/${paymentId}/status`);
  }
}