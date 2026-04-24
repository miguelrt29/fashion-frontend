import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  maxDiscount?: number;
  expiresAt?: Date;
  usageLimit: number;
  usedCount: number;
  applicableCategories?: string[];
  isActive: boolean;
}

export interface ValidateCouponResponse {
  valid: boolean;
  discount: number;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class CouponsService {
  private apiUrl = `${environment.apiUrl}/coupons`;

  constructor(private http: HttpClient) {}

  validateCoupon(code: string, total: number, category?: string): Observable<ValidateCouponResponse> {
    return this.http.get<ValidateCouponResponse>(
      `${this.apiUrl}/validate?code=${code}&total=${total}${category ? `&category=${category}` : ''}`
    );
  }

  applyCoupon(code: string): Observable<Coupon> {
    return this.http.post<Coupon>(`${this.apiUrl}/apply`, { code });
  }

  getActiveCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(`${this.apiUrl}/active`);
  }

  getAllCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(`${this.apiUrl}`);
  }

  getCouponById(id: string): Observable<Coupon> {
    return this.http.get<Coupon>(`${this.apiUrl}/${id}`);
  }

  createCoupon(coupon: {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minPurchase?: number;
    maxDiscount?: number;
    expiresAt?: Date;
    usageLimit?: number;
    applicableCategories?: string[];
  }): Observable<Coupon> {
    return this.http.post<Coupon>(`${this.apiUrl}`, coupon);
  }

  updateCoupon(id: string, data: {
    type?: 'percentage' | 'fixed';
    value?: number;
    minPurchase?: number;
    maxDiscount?: number;
    expiresAt?: Date;
    usageLimit?: number;
    applicableCategories?: string[];
    isActive?: boolean;
  }): Observable<Coupon> {
    return this.http.put<Coupon>(`${this.apiUrl}/${id}`, data);
  }

  deleteCoupon(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleCouponActive(id: string): Observable<Coupon> {
    return this.http.put<Coupon>(`${this.apiUrl}/${id}/toggle`, {});
  }

  calculateDiscount(coupon: Coupon, cartTotal: number): number {
    let discount: number;
    if (coupon.type === 'percentage') {
      discount = cartTotal * (coupon.value / 100);
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.value;
    }
    return discount;
  }
}