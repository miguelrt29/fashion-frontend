import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  isApproved: boolean;
  verified?: boolean;
  date?: Date;
  pros?: string[];
  cons?: string[];
  helpful?: number;
  images?: string[];
  createdAt: Date;
}

export interface ReviewStats {
  average: number;
  count: number;
  total: number;
  distribution: number[];
  verifiedReviews: number;
  withPhotos: number;
}

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private apiUrl = `${environment.apiUrl}/reviews`;
  private reviewsSubject = new BehaviorSubject<Review[]>([]);
  reviews$ = this.reviewsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getProductReviews(productId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/product/${productId}`);
  }

  getProductRating(productId: string): Observable<ReviewStats> {
    return this.http.get<ReviewStats>(`${this.apiUrl}/product/${productId}/rating`);
  }

  getMyReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/my-reviews`);
  }

  createReview(review: {
    productId: string;
    rating: number;
    title?: string;
    comment?: string;
  }): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}`, review);
  }

  updateReview(reviewId: string, review: {
    rating: number;
    title?: string;
    comment?: string;
  }): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/${reviewId}`, review);
  }

  deleteReview(reviewId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reviewId}`);
  }

  getPendingReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/admin/pending`);
  }

  approveReview(reviewId: string): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/admin/approve/${reviewId}`, {});
  }

  getReviewsForProduct(productId: string, page: number = 1): Review[] {
    return this.reviewsSubject.value.filter(r => r.productId === productId).slice(0, page * 10);
  }

  getStatsForProduct(productId: string): ReviewStats {
    const reviews = this.reviewsSubject.value.filter(r => r.productId === productId);
    const total = reviews.length;
    const count = reviews.reduce((sum, r) => sum + r.rating, 0);
    const distribution = [0, 0, 0, 0, 0];
    let verifiedReviews = 0;
    let withPhotos = 0;

    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        distribution[r.rating - 1]++;
      }
      if (r.verified) verifiedReviews++;
      if (r.images && r.images.length > 0) withPhotos++;
    });

    return {
      average: total ? count / total : 0,
      count: total,
      total,
      distribution,
      verifiedReviews,
      withPhotos
    };
  }

  getAllReviewsForProduct(productId: string): Review[] {
    return this.reviewsSubject.value.filter(r => r.productId === productId);
  }

  addReview(
    productId: string,
    rating: number,
    comment: string,
    title: string,
    userName: string,
    userId: string,
    pros: string[],
    cons: string[],
    images: string[],
    verified: boolean
  ): Observable<Review> {
    return this.createReview({ productId, rating, title, comment }).pipe(
      tap(review => {
        const reviews = this.reviewsSubject.value;
        this.reviewsSubject.next([{ ...review, userName, verified, pros, cons, images, helpful: 0 }, ...reviews]);
      })
    );
  }

  markHelpful(reviewId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${reviewId}/helpful`, {}).pipe(
      tap(() => {
        const reviews = this.reviewsSubject.value.map(r => {
          if (r.id === reviewId) {
            return { ...r, helpful: (r.helpful || 0) + 1 };
          }
          return r;
        });
        this.reviewsSubject.next(reviews);
      })
    );
  }
}