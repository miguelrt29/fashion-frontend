import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (token) {
    const cloned = req.clone({
      headers: req.headers
        .set('Authorization', `Bearer ${token}`)
        .set('X-Requested-With', 'XMLHttpRequest')
        .set('X-Content-Type-Options', 'nosniff')
        .set('Cache-Control', 'no-cache, no-store, must-revalidate')
    });
    return next(cloned);
  }

  const cloned = req.clone({
    headers: req.headers
      .set('X-Requested-With', 'XMLHttpRequest')
      .set('X-Content-Type-Options', 'nosniff')
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
  });

  return next(cloned);
};