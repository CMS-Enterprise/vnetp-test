import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { CookieService } from 'ngx-cookie-service';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;

  beforeAll(() => {
    const cookieService = {
      deleteAll: jest.fn(),
    };

    const http = {
      post: jest.fn(() => of({ token: '' })),
    };

    TestBed.configureTestingModule({
      providers: [AuthService, { provide: CookieService, useValue: cookieService }, { provide: HttpClient, useValue: http }],
    });
    service = TestBed.get(AuthService);
  });
  afterEach(() => {
    TestBed.resetTestingModule();
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
