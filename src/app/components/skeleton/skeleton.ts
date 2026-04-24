import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton" [ngClass]="type" [style.width]="width" [style.height]="height">
      <div class="shimmer"></div>
    </div>
  `,
  styles: [`
    .skeleton {
      background: #f4f4f5;
      border-radius: 8px;
      position: relative;
      overflow: hidden;
    }
    
    .skeleton.text {
      height: 16px;
    }
    
    .skeleton.title {
      height: 24px;
    }
    
    .skeleton.image {
      aspect-ratio: 3/4;
      border-radius: 12px;
    }
    
    .skeleton.circle {
      border-radius: 50%;
    }
    
    .skeleton.card {
      border-radius: 12px;
      overflow: hidden;
    }
    
    .shimmer {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.5) 50%,
        transparent 100%
      );
      animation: shimmer 1.5s infinite;
    }
    
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `]
})
export class SkeletonComponent {
  @Input() type: 'text' | 'title' | 'image' | 'circle' | 'card' | 'custom' = 'text';
  @Input() width = '100%';
  @Input() height = 'auto';
}

@Component({
  selector: 'app-skeleton-product-card',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="skeleton-card">
      <app-skeleton type="image"></app-skeleton>
      <div class="card-info">
        <app-skeleton type="text" width="40%"></app-skeleton>
        <app-skeleton type="title" width="80%"></app-skeleton>
        <app-skeleton type="text" width="30%"></app-skeleton>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-card {
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
    }
    
    .card-info {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `]
})
export class SkeletonProductCard {}

@Component({
  selector: 'app-skeleton-product-grid',
  standalone: true,
  imports: [CommonModule, SkeletonProductCard],
  template: `
    <div class="skeleton-grid" [style.grid-template-columns]="'repeat(' + columns + ', 1fr)'">
      <app-skeleton-product-card *ngFor="let i of items"></app-skeleton-product-card>
    </div>
  `,
  styles: [`
    .skeleton-grid {
      display: grid;
      gap: 24px;
    }
  `]
})
export class SkeletonProductGrid {
  @Input() columns = 4;
  @Input() count = 8;
  
  get items(): number[] {
    return Array(this.count).fill(0).map((_, i) => i);
  }
}

@Component({
  selector: 'app-skeleton-product-detail',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="skeleton-detail">
      <div class="detail-images">
        <app-skeleton type="image"></app-skeleton>
      </div>
      <div class="detail-info">
        <app-skeleton type="text" width="30%"></app-skeleton>
        <app-skeleton type="title" width="70%"></app-skeleton>
        <app-skeleton type="text" width="40%"></app-skeleton>
        <div class="detail-price">
          <app-skeleton type="title" width="25%"></app-skeleton>
        </div>
        <app-skeleton type="text"></app-skeleton>
        <app-skeleton type="text"></app-skeleton>
        <app-skeleton type="text" width="60%"></app-skeleton>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-detail {
      display: grid;
      grid-template-columns: 1fr 480px;
      gap: 80px;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px;
    }
    
    .detail-images app-skeleton {
      aspect-ratio: 3/4;
    }
    
    .detail-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .detail-price {
      margin: 8px 0;
    }
    
    @media (max-width: 900px) {
      .skeleton-detail {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SkeletonProductDetail {}

@Component({
  selector: 'app-skeleton-reviews',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="skeleton-reviews">
      <div class="reviews-summary">
        <app-skeleton type="title" width="40%"></app-skeleton>
        <app-skeleton type="text" width="60%"></app-skeleton>
      </div>
      <div class="reviews-list">
        <div class="review-item" *ngFor="let i of items">
          <div class="review-header">
            <div class="reviewer">
              <app-skeleton type="circle" width="44px" height="44px"></app-skeleton>
              <div class="reviewer-info">
                <app-skeleton type="text" width="120px"></app-skeleton>
                <app-skeleton type="text" width="80px"></app-skeleton>
              </div>
            </div>
            <app-skeleton type="text" width="60px"></app-skeleton>
          </div>
          <app-skeleton type="title" width="70%"></app-skeleton>
          <app-skeleton type="text"></app-skeleton>
          <app-skeleton type="text"></app-skeleton>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-reviews {
      margin-top: 40px;
    }
    
    .reviews-summary {
      margin-bottom: 32px;
    }
    
    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .review-item {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 24px;
      border: 1px solid #f4f4f5;
      border-radius: 12px;
    }
    
    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .reviewer {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    
    .reviewer-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
  `]
})
export class SkeletonReviews {
  items = [1, 2, 3];
}