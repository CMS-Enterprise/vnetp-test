import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NavigationInterceptorService } from './navigation-interceptor.service';
import { DefaultUrlSerializer, NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';

describe('NavigationInterceptorService', () => {
  let service: NavigationInterceptorService;
  let mockRouter: any;
  let eventsSubject: Subject<any>;

  beforeEach(() => {
    eventsSubject = new Subject<any>();

    mockRouter = {
      events: eventsSubject.asObservable(),
      parseUrl: jest.fn(),
      createUrlTree: jest.fn(),
      navigateByUrl: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NavigationInterceptorService, { provide: Router, useValue: mockRouter }],
    });
    service = TestBed.inject(NavigationInterceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should navigate by url when a modification happens', () => {
    const event = new NavigationStart(1, '/some-path?tenantId=123');
    const urlTree = new DefaultUrlSerializer().parse('/some-path?tenantId=123');
    const newUrlTree = new DefaultUrlSerializer().parse('/some-path');

    mockRouter.parseUrl.mockReturnValue(urlTree);
    mockRouter.createUrlTree.mockReturnValue(newUrlTree);

    eventsSubject.next(event);

    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/some-path'], {
      queryParams: {},
      fragment: null,
      preserveFragment: true,
    });
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/some-path', { replaceUrl: true });
  });

  it('should not navigate by url when no modification happens', () => {
    const event = new NavigationStart(1, '/wan-form?tenantId=123');
    const urlTree = new DefaultUrlSerializer().parse('/wan-form?tenantId=123');

    mockRouter.parseUrl.mockReturnValue(urlTree);

    eventsSubject.next(event);

    expect(mockRouter.createUrlTree).not.toHaveBeenCalled();
    expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
  });
});
