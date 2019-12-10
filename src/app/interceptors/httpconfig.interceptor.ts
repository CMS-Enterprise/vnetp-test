import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpResponse,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class HttpConfigInterceptor {
  constructor(private auth: AuthService, private toastr: ToastrService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const currentUser = this.auth.currentUserValue;
    const skipAuthHeader = request.url.includes('auth/login');

    // Send the current token, if it is stale, we will get a 401
    // back and the user will be logged out.
    if (!skipAuthHeader && !request.headers.has('Authorization') && currentUser.Token) {
      request = request.clone({
        headers: request.headers.set(
          'Authorization',
          `Bearer ${currentUser.Token}`,
        ),
      });
    }

    if (!request.headers.has('Accept')) {
      request = request.clone({
        headers: request.headers.set('Accept', 'application/json'),
      });
    }

    if (!request.headers.has('Content-Type') && request.method !== 'GET') {
      request = request.clone({
        headers: request.headers.set('Content-Type', 'application/json'),
      });
    }

    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          if (!environment.production) {
            // console.log('debug-httpevent-->>', event);
          }
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        let toastrMessage = 'Request Failed!';

        switch (error.status) {
          case 401:
            this.auth.logout();
            return;
          case 403:
            toastrMessage = 'Unauthorized.';
            break;
        }

        const data = {
          error,
          status: error.status,
        };

        console.error(data);

        this.toastr.error(toastrMessage);
        return throwError(error);
      }),
    );
  }
}
