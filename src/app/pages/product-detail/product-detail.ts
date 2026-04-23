import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../services/products';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit {
  product: any = null;
  loading = true;
  selectedSize = '';
  selectedColor = '';
  quantity = 1;
  added = false;

  constructor(
    private productsService: ProductsService,
    private cartService: CartService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productsService.getOne(id).subscribe({
        next: (product) => {
          this.product = product;
          this.selectedSize = product.sizes?.[0] || '';
          this.selectedColor = product.colors?.[0] || '';
          this.loading = false;
        },
        error: () => this.loading = false
      });
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  increaseQuantity() {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  addToCart() {
    if (!this.selectedSize || !this.selectedColor) return;
    this.cartService.addItem({
      id: this.product.id,
      name: this.product.name,
      price: this.product.price,
      quantity: this.quantity,
      size: this.selectedSize,
      color: this.selectedColor,
      image: this.product.images?.[0] || ''
    });
    this.added = true;
    setTimeout(() => this.added = false, 2000);
  }
}