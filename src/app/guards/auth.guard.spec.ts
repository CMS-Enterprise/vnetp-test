import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: Router;

  const mockRouter = {
    navigate: jest.fn(),
    navigateByUrl: jest.fn(),
  };

  const mockAuthService = {
    currentUserValue: null,
  };

  const mockRoute = {} as ActivatedRouteSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthGuard, { provide: Router, useValue: mockRouter }, { provide: AuthService, useValue: mockAuthService }],
    });

    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockAuthService.currentUserValue = null;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow activation if user is logged in', () => {
    mockAuthService.currentUserValue = { username: 'test' };
    const mockState = { url: '/some/path' } as RouterStateSnapshot;
    const canActivate = guard.canActivate(mockRoute, mockState);
    expect(canActivate).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should redirect to /login without returnUrl if user is not logged in and tenant is not in URL', () => {
    const mockState = { url: '/some/path' } as RouterStateSnapshot;
    const canActivate = guard.canActivate(mockRoute, mockState);
    expect(canActivate).toBe(false);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to /login with returnUrl if user is not logged in and tenant is in URL', () => {
    const returnUrl = '/some/path?tenant=TENANT_A';
    const mockState = { url: returnUrl } as RouterStateSnapshot;
    const canActivate = guard.canActivate(mockRoute, mockState);
    expect(canActivate).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl } });
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
