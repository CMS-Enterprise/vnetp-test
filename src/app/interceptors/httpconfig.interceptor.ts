import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';

@Injectable()
export class HttpConfigInterceptor {
  constructor(private authService: AuthService, private toastr: ToastrService, private route: ActivatedRoute) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let tenant = '';
    this.route.queryParams.subscribe(qp => {
      tenant = qp.tenant;
    });

    const isLoggedIn = this.authService.isLoggedIn();
    if (isLoggedIn && environment.userClaims) {
      const headers = new HttpHeaders({ Authorization: this.authService.getAuthorizationHeaderValue() });
      request = request.clone({
        headers,
        params: request.params.set('tenant', tenant),
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
        let toastrMessage = 'Request Failed!';
        switch (error.status) {
          case 400:
            toastrMessage = 'Bad Request';
            break;
          case 401:
            this.authService.logout('unauthorized');
            break;
          case 403:
            this.authService.logout('unauthorized');
            break;
        }

        console.error({ error, status });
        this.toastr.error(toastrMessage);

        return throwError(error);
      }),
    );
  }
}
