import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CookieService],
    });
    service = TestBed.get(AuthService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Valid Tokens', () => {
    it('should parse a user with roles', () => {
      const userWithRoles = service.getUserFromToken(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc4MzFiMzBiLTFjYmUtNGFkMy04Mzg4LTQwYmMyNDRkOTQ1YSIsInVzZXJuYW1lIjoidGVzdCIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsInJvbGVzIjpbIkFkbWluaXN0cmF0b3IiXSwiaWF0IjoxNTc1OTk5ODExLCJleHAiOjE1NzYwMDM0MTF9.LgF_PJD2kWIIA4GcVY2xPW6w7Go6zL5MXkghJQ7UOHY',
      );
      expect(userWithRoles).toBeTruthy();
    });

    it('should parse a user without roles', () => {
      const userWithoutRoles = service.getUserFromToken(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijg5Y2ZlODIzLTY3YjEtNDNiOS04N2QxLWQ5NzkwZGJlZTFjMCIsInVzZXJuYW1lIjoidGVzdDIiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJyb2xlcyI6bnVsbCwiaWF0IjoxNTc2MDAwNDY5LCJleHAiOjE1NzYwMDQwNjl9.JOUP-HAebGm8t3Ag1BpoyjcMkInkhkhMwOwPTZwxyvY',
      );
      expect(userWithoutRoles).toBeTruthy();
    });
  });

  describe('Invalid Tokens', () => {
    it('should not parse invalid tokens', () => {
      const invalidToken = service.getUserFromToken(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijg5Y2ZlODIzLTY3YjEtNDNiOS04N2QxLWQ5NzkwZGJlZTFjMCIsInVzZXJuYW1lIjoidGVzdDIiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJyb2xlcyI6bnVsbCwiaWF0IjoxNTc2MDAwNDY5LCJleHAiOjE1NzYwMDQwNjl1.JOUP-HAebGm8t3Ag1BpoyjcMkInkhkhMwOwPTZwxyvY',
      );
      expect(invalidToken).toBeNull();
    });

    it('should not parse users without emails', () => {
      const missingEmail = service.getUserFromToken(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijg5Y2ZlODIzLTY3YjEtNDNiOS04N2QxLWQ5NzkwZGJlZTFjMCIsInVzZXJuYW1lIjoidGVzdDIiLCJyb2xlcyI6bnVsbCwiaWF0IjoxNTc2MDAwNjUyLCJleHAiOjE1NzYwMDQyNTJ9.1k3jLBtSFiasfB0MhBi-J0yHV3JOjEGR3Zn55Nhfyb4',
      );
      expect(missingEmail).toBeNull();
    });

    it('should not parse empty tokens', () => {
      const missingToken = service.getUserFromToken('');
      expect(missingToken).toBeNull();
      const nullToken = service.getUserFromToken(null);
      expect(nullToken).toBeNull();
      const undefinedToken = service.getUserFromToken(undefined);
      expect(undefinedToken).toBeNull();
    });
  });
});
