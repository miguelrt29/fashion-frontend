import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.Home),
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products/products').then(m => m.Products),
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./pages/product-detail/product-detail').then(m => m.ProductDetail),
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart').then(m => m.Cart),
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout').then(m => m.Checkout),
    canActivate: [authGuard],
  },
  {
    path: 'favorites',
    loadComponent: () => import('./pages/favorites/favorites').then(m => m.Favorites),
  },
  {
    path: 'tracking',
    loadComponent: () => import('./pages/order-tracking/order-tracking').then(m => m.OrderTracking),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password').then(m => m.ForgotPassword),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/reset-password/reset-password').then(m => m.ResetPassword),
  },
  {
    path: 'order-confirmation',
    loadComponent: () => import('./pages/order-confirmation/order-confirmation').then(m => m.OrderConfirmation),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.Register),
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then(m => m.Profile),
    canActivate: [authGuard],
  },
  {
    path: '404',
    loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFound),
  },
  {
    path: '**',
    redirectTo: '404',
  },
];