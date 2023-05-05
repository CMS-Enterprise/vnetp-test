import { HttpConfigInterceptor } from './httpconfig.interceptor';
import { AuthService } from '../services/auth.service';
import { DefaultGlobalConfig, ToastrModule, ToastrService, ToastrConfig } from 'ngx-toastr';
import {
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
  HttpHeaders,
  HttpEvent,
  HttpEventType,
  HttpHandler,
  HttpParams,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { map } from 'rxjs/operators';

// TODO: this returns a bunch of errors that need to be supressed
describe('HttpConfigInterceptor', () => {
  let interceptor: HttpConfigInterceptor;

  const mockToastrService = {
    success: jest.fn(),
    error: jest.fn(),
  };

  const mockActivatedRoute = {
    snapshot: {
      queryParams: {
        tenant: '',
      },
    },
    queryParams: of({ tenant: 'mockTenant' }),
  };

  const mockAuthService = {
    currentUserValue: { token: 'mockToken' },
    logout: jest.fn(),
  } as any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ToastrModule],
      providers: [
        HttpConfigInterceptor,
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastrService, useValue: mockToastrService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    });

    interceptor = TestBed.inject(HttpConfigInterceptor);
    // mockAuthService = TestBed.inject(mockAuthService);
  });

  describe('processSuccessRequest ', () => {
    it('should do nothing when the request method is get', () => {
      const res = interceptor.processSuccessRequest({ method: 'GET' }, {});
      expect(res).toBeUndefined();
    });

    it('should show login successful when the request method is post and responseEvent includes auth/', () => {
      interceptor.processSuccessRequest({ method: 'POST' }, { url: 'auth/' });
      expect(mockToastrService.success).toHaveBeenCalledWith('Login Successful');
    });

    it('should show Bulk Upload Successful when the request method is post and responseEvent includes bulk', () => {
      interceptor.processSuccessRequest({ method: 'POST' }, { url: 'bulk' });
      expect(mockToastrService.success).toHaveBeenCalledWith('Bulk Upload Successful');
    });

    it('should show request successful when the request method is post and responseEvent does not include auth/ or bulk', () => {
      interceptor.processSuccessRequest({ method: 'POST' }, { url: 'test' });
      expect(mockToastrService.success).toHaveBeenCalledWith('Request Successful');
    });
  });

  describe('intercept', () => {
    let mockHttpHandler: HttpHandler;

    beforeEach(() => {
      mockHttpHandler = {
        handle: jest.fn(() => of(new HttpResponse({ status: 200 }))),
      } as any;
    });

    it('should add headers and tenant param when request is not a login request and has a token', () => {
      mockActivatedRoute.snapshot.queryParams.tenant = 'mockTenant';

      const request = new HttpRequest('GET', 'http://test-api.com/data');
      interceptor.intercept(request, mockHttpHandler);

      const modifiedRequest = (mockHttpHandler.handle as jest.Mock).mock.calls[0][0];
      expect(modifiedRequest.headers.get('Authorization')).toBe('Bearer mockToken');
      expect(modifiedRequest.headers.get('Cache-Control')).toBe('no-cache');
      expect(modifiedRequest.headers.get('Pragma')).toBe('no-cache');
      expect(modifiedRequest.params.get('tenant')).toBe('mockTenant');
    });

    it('should log out if there is no tenant', () => {
      mockActivatedRoute.snapshot.queryParams.tenant = '';
      const spy = spyOn(mockActivatedRoute.queryParams, 'subscribe');
      spy.and.callFake(callback => {
        callback({ tenant: '' });
      });

      const request = new HttpRequest('GET', 'http://test-api.com/data');
      interceptor.intercept(request, mockHttpHandler);

      (mockHttpHandler.handle as jest.Mock).mock.calls[0][0];
      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('should set Content-Type header when missing and method is not GET', () => {
      mockActivatedRoute.snapshot.queryParams.tenant = 'mockTenant';

      const request = new HttpRequest('OPTIONS', 'http://test-api.com/data');
      interceptor.intercept(request, mockHttpHandler);
      const modifiedRequest = (mockHttpHandler.handle as jest.Mock).mock.calls[0][0];

      expect(modifiedRequest.headers.get('Content-Type')).toBe('application/json');
    });

    it('should modify URL when join parameter has more than one value', () => {
      mockActivatedRoute.snapshot.queryParams.tenant = 'mockTenant';

      const request = new HttpRequest('GET', 'http://test-api.com/data', {
        params: new HttpParams().set('join', 'value1,value2,value3'),
      });

      interceptor.intercept(request, mockHttpHandler);
      const modifiedRequest = (mockHttpHandler.handle as jest.Mock).mock.calls[0][0];

      expect(modifiedRequest.url).toBe('http://test-api.com/data?join=value1&join=value2&join=value3');
      expect(modifiedRequest.params.has('join')).toBe(false);
    });

    it('should replace filter parameter with multiple values', () => {
      mockActivatedRoute.snapshot.queryParams.tenant = 'mockTenant';

      const request = new HttpRequest('GET', 'http://test-api.com/data', { params: new HttpParams().set('filter', 'abc,def') });
      interceptor.intercept(request, mockHttpHandler);
      const modifiedRequest = (mockHttpHandler.handle as jest.Mock).mock.calls[0][0];

      expect(modifiedRequest.url).toBe('http://test-api.com/data?filter=abc&filter=def');
      expect(modifiedRequest.params.has('filter')).toBeFalsy();
    });

    it('should call processSuccessRequest when response is an HttpResponse', () => {
      const request = new HttpRequest('GET', 'http://test-api.com/data');
      const httpResponse = new HttpResponse({ status: 200 });

      spyOn(interceptor, 'processSuccessRequest');

      interceptor.intercept(request, mockHttpHandler).subscribe((event: HttpEvent<any>) => {
        expect(interceptor.processSuccessRequest).toHaveBeenCalledWith(request, httpResponse);
      });
    });

    it('should log error response and display toastr message on failure', () => {
      const errorResponse = new HttpErrorResponse({ status: 403 });
      (mockHttpHandler.handle as jest.Mock).mockReturnValueOnce(throwError(errorResponse));

      interceptor.intercept(new HttpRequest('GET', 'http://test-api.com/data'), mockHttpHandler).subscribe(
        () => {
          fail('Expected interceptor to throw error');
        },
        (error: HttpErrorResponse) => {
          expect(error).toBe(errorResponse);
          expect(console.error).toHaveBeenCalledWith({ error: errorResponse, status: 403 });
          expect(mockToastrService.error).toHaveBeenCalledWith('Unauthorized');
        },
      );
    });

    it('should display toastr message with error description on 400 error response with description', () => {
      const errorResponse = new HttpErrorResponse({
        status: 400,
        error: {
          description: 'Some error description',
        },
      });
      (mockHttpHandler.handle as jest.Mock).mockReturnValueOnce(throwError(errorResponse));

      interceptor.intercept(new HttpRequest('GET', 'http://test-api.com/data'), mockHttpHandler).subscribe(
        () => {
          fail('Expected interceptor to throw error');
        },
        (error: HttpErrorResponse) => {
          expect(error).toBe(errorResponse);
          expect(console.error).toHaveBeenCalledWith({ error: errorResponse, status: 400 });
          expect(mockToastrService.error).toHaveBeenCalledWith('Bad Request - Some error description');
        },
      );
    });

    it('should display toastr message with default text on 400 error response without description', () => {
      const errorResponse = new HttpErrorResponse({
        status: 400,
        error: {},
      });
      (mockHttpHandler.handle as jest.Mock).mockReturnValueOnce(throwError(errorResponse));

      interceptor.intercept(new HttpRequest('GET', 'http://test-api.com/data'), mockHttpHandler).subscribe(
        () => {
          fail('Expected interceptor to throw error');
        },
        (error: HttpErrorResponse) => {
          expect(error).toBe(errorResponse);
          expect(console.error).toHaveBeenCalledWith({ error: errorResponse, status: 400 });
          expect(mockToastrService.error).toHaveBeenCalledWith('Unhandled Error Response');
        },
      );
    });

    it('should call auth.logout with force=true when 401 status is received', () => {
      const errorResponse = new HttpErrorResponse({ status: 401 });
      (mockHttpHandler.handle as jest.Mock).mockReturnValueOnce(throwError(errorResponse));
      const authSpy = jest.spyOn(mockAuthService, 'logout');

      interceptor.intercept(new HttpRequest('GET', 'http://test-api.com/data'), mockHttpHandler).subscribe(
        () => {
          fail('Expected interceptor to throw error');
        },
        (error: HttpErrorResponse) => {
          expect(error).toBe(errorResponse);
          expect(authSpy).toHaveBeenCalledWith(true);
        },
      );
    });
  });
});
