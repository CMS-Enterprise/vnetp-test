import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';

@Injectable()
export class HttpConfigInterceptor {
  constructor(private auth: AuthService, private toastr: ToastrService, private route: ActivatedRoute) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const currentUser = this.auth.currentUserValue;
    const isLogin = request.url.includes('auth/');

    // Send the current token, if it is stale, we will get a 401
    // back and the user will be logged out.
    if (!isLogin && !request.headers.has('Authorization') && currentUser.token) {
      // Get tenant from the tenant query param.
      let tenant = '';
      this.route.queryParams.subscribe(qp => {
        tenant = qp.tenant;
      });

      // If no tenant is selected, log the user out and allow them to reselect a tenant.
      if (!tenant) {
        this.auth.logout();
      }

      const headers = new HttpHeaders({
        Authorization: `Bearer ${currentUser.token}`,
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      });
      request = request.clone({ headers, params: request.params.set('tenant', tenant) });
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

        if (!isLogin) {
          switch (error.status) {
            case 400:
              if (error?.error?.message?.message) {
                toastrMessage = `Bad Request - ${error.error.message.message}`;
              }
              if (error?.error?.message) {
                toastrMessage = `Bad Request - ${error.error.message}`;
              } else {
                toastrMessage = 'Bad Request';
              }
              break;
            case 401:
              this.auth.logout(true);
              return;
            case 403:
              toastrMessage = 'Unauthorized';
              break;
          }
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
