import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AuthServiceService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CookieService],
    }),
  );

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    const service: AuthService = TestBed.get(AuthService);
    expect(service).toBeTruthy();
  });

  it('should handle valid tokens (does not check expiry)', () => {
    const service: AuthService = TestBed.get(AuthService);
    const userWithRoles = service.getUserFromToken(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc4MzFiMzBiLTFjYmUtNGFkMy04Mzg4LTQwYmMyNDRkOTQ1YSIsInVzZXJuYW1lIjoidGVzdCIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsInJvbGVzIjpbIkFkbWluaXN0cmF0b3IiXSwiaWF0IjoxNTc1OTk5ODExLCJleHAiOjE1NzYwMDM0MTF9.LgF_PJD2kWIIA4GcVY2xPW6w7Go6zL5MXkghJQ7UOHY',
    );
    expect(userWithRoles).toBeTruthy();
    const userWithoutRoles = service.getUserFromToken(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijg5Y2ZlODIzLTY3YjEtNDNiOS04N2QxLWQ5NzkwZGJlZTFjMCIsInVzZXJuYW1lIjoidGVzdDIiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJyb2xlcyI6bnVsbCwiaWF0IjoxNTc2MDAwNDY5LCJleHAiOjE1NzYwMDQwNjl9.JOUP-HAebGm8t3Ag1BpoyjcMkInkhkhMwOwPTZwxyvY',
    );
    expect(userWithoutRoles).toBeTruthy();
  });

  it('should handle invalid tokens (does not check expiry)', () => {
    const service: AuthService = TestBed.get(AuthService);
    const invalidToken = service.getUserFromToken(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijg5Y2ZlODIzLTY3YjEtNDNiOS04N2QxLWQ5NzkwZGJlZTFjMCIsInVzZXJuYW1lIjoidGVzdDIiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJyb2xlcyI6bnVsbCwiaWF0IjoxNTc2MDAwNDY5LCJleHAiOjE1NzYwMDQwNjl1.JOUP-HAebGm8t3Ag1BpoyjcMkInkhkhMwOwPTZwxyvY',
    );
    expect(invalidToken).toBeNull();
    const missingEmail = service.getUserFromToken(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijg5Y2ZlODIzLTY3YjEtNDNiOS04N2QxLWQ5NzkwZGJlZTFjMCIsInVzZXJuYW1lIjoidGVzdDIiLCJyb2xlcyI6bnVsbCwiaWF0IjoxNTc2MDAwNjUyLCJleHAiOjE1NzYwMDQyNTJ9.1k3jLBtSFiasfB0MhBi-J0yHV3JOjEGR3Zn55Nhfyb4',
    );
    expect(missingEmail).toBeNull();
    const missingToken = service.getUserFromToken('');
    expect(missingToken).toBeNull();
    const nullToken = service.getUserFromToken(null);
    expect(nullToken).toBeNull();
    const undefinedToken = service.getUserFromToken(undefined);
    expect(undefinedToken).toBeNull();
  });
});
