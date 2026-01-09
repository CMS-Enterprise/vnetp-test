import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { UserDto } from '../../../client/model/models';
import { RouterTestingModule } from '@angular/router/testing';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routeService: any;
  let mockLocation: any;

  beforeEach(() => {
    localStorage.clear();
    mockLocation = {
      href: '',
      reload: jest.fn(),
    };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [AuthService],
    });

    // routeService = {
    //    getCurrentNavigation: jest.fn().mockResolvedValue({finalUrl: {queryParams: {tenant: 'tenant1'}}})
    //  } as any

    service = TestBed.inject(AuthService);
    jest.spyOn(service['router'], 'getCurrentNavigation').mockResolvedValue({ finalUrl: { queryParams: { tenant: 'tenant1' } } } as never);

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('localStorage handling', () => {
    it('should handle missing user in localStorage', () => {
      expect(service.currentUserValue).toBeNull();
    });

    it('should handle missing tenant in localStorage', () => {
      expect(service.currentTenantValue).toBeNull();
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorage.setItem('user', 'invalid json');
      localStorage.setItem('tenantQueryParam', 'invalid json');

      // Reset TestBed to force new instance
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [AuthService],
      });

      const newService = TestBed.inject(AuthService);
      expect(newService.currentUserValue).toBeNull();
      expect(newService.currentTenantValue).toBeNull();
    });

    it('should set both user and tenant when both exist in localStorage', () => {
      const mockUser: UserDto = { token: 'test-token' } as UserDto;
      const mockTenant = 'test-tenant';

      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('tenantQueryParam', JSON.stringify(mockTenant));

      // Reset TestBed to force new instance
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [AuthService],
      });

      const newService = TestBed.inject(AuthService);
      expect(newService.currentUserValue).toEqual(mockUser);
      expect(newService.currentTenantValue).toBe(mockTenant);
    });

    it('should only set user when tenant is missing', () => {
      const mockUser: UserDto = { token: 'test-token' } as UserDto;

      localStorage.setItem('user', JSON.stringify(mockUser));

      // Reset TestBed to force new instance
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [AuthService],
      });

      const newService = TestBed.inject(AuthService);
      expect(newService.currentUserValue).toEqual(mockUser);
      expect(newService.currentTenantValue).toBeNull();
    });
  });

  describe('login', () => {
    it('should store user in localStorage and update currentUser on successful login', () => {
      const mockUser: UserDto = { token: 'test-token' } as UserDto;
      const mockResponse = { ...mockUser };
      service.login({ username: 'test', password: 'test' }).subscribe();
      const req = httpMock.expectOne(`${environment.apiBase}/v1/auth/token`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
      expect(service.currentUserValue).toEqual(mockUser);
    });

    it('should not store user in localStorage if login response has no token', () => {
      const mockResponse = { username: 'test' };
      service.login({ username: 'test', password: 'test' }).subscribe();
      const req = httpMock.expectOne(`${environment.apiBase}/v1/auth/token`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
      expect(localStorage.getItem('user')).toBeNull();
      expect(service.currentUserValue).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear localStorage and reset subjects when logging out', () => {
      localStorage.setItem('user', JSON.stringify({ token: 'test' }));
      localStorage.setItem('tenantQueryParam', JSON.stringify('test-tenant'));
      service.logout();
      expect(localStorage.getItem('user')).toBeNull();
      expect(localStorage.getItem('tenantQueryParam')).toBeNull();
      expect(service.currentUserValue).toBeNull();
      expect(service.currentTenantValue).toBeNull();
    });

    it('should redirect to login page when keepReturnUrl is false', () => {
      service.logout();
      expect(mockLocation.href).toBe('/login');
    });

    it('should reload page when keepReturnUrl is true', () => {
      service.logout(true);
      expect(mockLocation.reload).toHaveBeenCalled();
    });
  });

  describe('tenant management', () => {
    it('should update currentTenantValue when set', () => {
      const mockTenant = 'test-tenant';
      service.currentTenantValue = mockTenant;
      expect(service.currentTenantValue).toBe(mockTenant);
    });

    it('should get tenants from API', () => {
      const mockToken = 'test-token';
      const mockTenants = [{ tenant: 'test1' }, { tenant: 'test2' }];
      service.getTenants(mockToken).subscribe(tenants => {
        expect(tenants).toEqual(mockTenants);
      });
      const req = httpMock.expectOne(`${environment.apiBase}/v1/auth/tenants`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush(mockTenants);
    });
  });
});
