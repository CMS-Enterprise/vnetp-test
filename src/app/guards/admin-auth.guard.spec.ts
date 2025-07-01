import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AdminAuthGuard } from './admin-auth.guard';

describe('AdminAuthGuard', () => {
  let guard: AdminAuthGuard;
  let router: Router;

  const mockRouter = {
    navigateByUrl: jest.fn(),
  };

  const mockAuthService = {
    currentUserValue: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminAuthGuard, { provide: Router, useValue: mockRouter }, { provide: AuthService, useValue: mockAuthService }],
    });

    guard = TestBed.inject(AdminAuthGuard);
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
    const canActivate = guard.canActivate();
    expect(canActivate).toBe(true);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should redirect to /login if user is not logged in', () => {
    const canActivate = guard.canActivate();
    expect(canActivate).toBe(false);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });
});
