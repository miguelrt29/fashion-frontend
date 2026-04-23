import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  isLoggedIn = false;
  cartCount = 0;
  menuOpen = false;
  user: any = null;

  constructor(
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.user = user;
      this.isLoggedIn = !!user;
    });
    this.cartService.items$.subscribe(items => {
      this.cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
    });
  }

  logout() {
    this.authService.logout();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}