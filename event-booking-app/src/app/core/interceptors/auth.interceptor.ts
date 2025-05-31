import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenStorageService } from '../services/token-storage.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private tokenStorage: TokenStorageService) {
    console.log('AuthInterceptor created');
  }

  // intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  //   const token = this.tokenStorage.getToken();

  //   if (token) {
  //     const cloned = req.clone({
  //       headers: req.headers.set('Authorization', `Bearer ${token}`)
  //     });
  //     return next.handle(cloned);
  //   }
  //   return next.handle(req);
  // }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  const token = this.tokenStorage.getToken();

  let clonedReq = req;

  if (token) {
    // Don't manually set Content-Type if body is FormData
    if (!(req.body instanceof FormData)) {
      clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } else {
      clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }

  return next.handle(clonedReq);
}

}
