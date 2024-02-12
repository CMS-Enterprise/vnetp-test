import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { IncidentService } from '../services/incident.service';

@Injectable()
export class HttpConfigInterceptor {
  constructor(
    private auth: AuthService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private incidentService: IncidentService,
  ) {}

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

    const incident = this.incidentService.getIncidentLocalStorage();
    console.log('incident', incident);
    if (incident) {
      request = request.clone({
        headers: request.headers.set('Incident', incident),
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
      const queryStingReplacement = request.params.get('join').split(',').join('&join=');
      const requestUrl = `${request.url}?join=${queryStingReplacement}`;
      request = request.clone({
        url: requestUrl,
        params: request.params.delete('join'),
      });
    }

    if (request.params.get('filter') && request.params.get('filter').split(',').length > 1) {
      const queryStingReplacement = request.params.get('filter').split(',').join('&filter=');
      const requestUrl = `${request.url}?filter=${queryStingReplacement}`;
      request = request.clone({
        url: requestUrl,
        params: request.params.delete('filter'),
      });
    }

    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          this.processSuccessRequest(request, event);
          if (!environment.production) {
            // console.log('debug-httpevent-->>', event);
          }
        }
        return event;
      }),
      catchError((errorResponse: HttpErrorResponse) => {
        let toastrMessage = 'Request Failed!';

        if (!isLogin) {
          switch (errorResponse.status) {
            case 400:
              if (errorResponse?.error?.description) {
                toastrMessage = `Bad Request - ${errorResponse?.error?.description}`;
              } else {
                // TODO: Adding this temporarily to capture errors without description.
                // console.log(errorResponse);
                toastrMessage = 'Unhandled Error Response';
              }
              break;
            case 401:
              this.auth.logout(true);
              break;
            case 403:
              toastrMessage = 'Unauthorized';
              break;
          }
        }

        /* eslint-disable-next-line */
        const data = {
          error: errorResponse,
          status: errorResponse.status,
        };

        // console.error(data);

        this.toastr.error(toastrMessage);
        return throwError(errorResponse);
      }),
    );
  }

  // if not a GET request, show appropriate success message
  processSuccessRequest(request, responseEvent) {
    if (request.method === 'GET') {
      return;
    }
    const loginNotificationMsg = 'Login Successful';
    const postNotificationMsg = 'Request Successful';
    const bulkNotificationMessage = 'Bulk Upload Successful';
    return responseEvent.url.includes('auth/')
      ? this.toastr.success(loginNotificationMsg)
      : responseEvent.url.includes('bulk')
      ? this.toastr.success(bulkNotificationMessage)
      : this.toastr.success(postNotificationMsg);
  }
}
