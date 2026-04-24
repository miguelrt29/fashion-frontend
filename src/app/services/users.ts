import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Address {
  id: string;
  label: string;
  type?: string;
  street: string;
  city: string;
  state: string;
  zip?: string;
  postalCode: string;
  country: string;
  apartment?: string;
  phone?: string;
  isDefault: boolean;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`);
  }

  updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/profile`, data);
  }

  changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/password`, data);
  }

  getAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.apiUrl}/addresses`);
  }

  getDefaultAddress(): Observable<Address | null> {
    return this.http.get<Address | null>(`${this.apiUrl}/addresses/default`);
  }

  addAddress(data: {
    label: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    apartment?: string;
    phone?: string;
    isDefault?: boolean;
  }): Observable<Address> {
    return this.http.post<Address>(`${this.apiUrl}/addresses`, data);
  }

  updateAddress(addressId: string, data: {
    label?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    apartment?: string;
    phone?: string;
    isDefault?: boolean;
  }): Observable<Address> {
    return this.http.put<Address>(`${this.apiUrl}/addresses/${addressId}`, data);
  }

  deleteAddress(addressId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/addresses/${addressId}`);
  }
}