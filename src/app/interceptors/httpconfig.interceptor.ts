import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class HttpConfigInterceptor {
  constructor(private auth: AuthService, private toastr: ToastrService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const currentUser = this.auth.currentUserValue;
    const isLogin = request.url.includes('auth/login');

    // Send the current token, if it is stale, we will get a 401
    // back and the user will be logged out.
    if (!isLogin && !request.headers.has('Authorization') && currentUser.Token) {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${currentUser.Token}`,
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      });
      request = request.clone({ headers });
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

    if (request.params.get('join') && request.params.get('join').split(',').length > 1) {
      const queryStingReplacement = request.params
        .get('join')
        .split(',')
        .join('&join=');
      const requestUrl = `${request.url}?join=${queryStingReplacement}`;
      request = request.clone({
        url: requestUrl,
        params: request.params.delete('join'),
      });
    }

    if (request.params.get('filter') && request.params.get('filter').split(',').length > 1) {
      const queryStingReplacement = request.params
        .get('filter')
        .split(',')
        .join('&filter=');
      const requestUrl = `${request.url}?filter=${queryStingReplacement}`;
      request = request.clone({
        url: requestUrl,
        params: request.params.delete('filter'),
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        const { status } = error;
        let toastrMessage = 'Request Failed';

        if (!isLogin) {
          switch (status) {
            case 400:
              toastrMessage = 'Bad Request';
              break;
            case 401:
              this.auth.logout();
              return;
            case 403:
              toastrMessage = 'Unauthorized';
              break;
            case 500:
              toastrMessage = 'Internal Server Error';
              break;
          }
        }

        console.error({ error, status });
        this.toastr.error(toastrMessage);

        return throwError(error);
      }),
    );
  }
}
