import { Injectable, Inject } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse
} from '@angular/common/http';

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

        if (!request.headers.has('Authorization')) {
            request = request.clone({ headers: request.headers.set('Authorization', `Basic ${currentUser.Token}`) });
        }

        if (!request.headers.has('Content-Type')) {
            request = request.clone({ headers: request.headers.set('Content-Type', 'application/json') });
        }
        request = request.clone({ headers: request.headers.set('Accept', 'application/json') });

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

                // Redirect to login page if a 401 error is returned.
                if (!environment.authBypass && error.status === 401) {
                    this.auth.logout();
                    location.reload();
                    return;
                }

                let data = {};

                data = {
                    reason: error && error.error.reason ? error.error.reason : '',
                    status: error.status
                };

                this.toastr.error('Request Failed!');
                return throwError(error);
            }));
    }
}
