import { TestBed } from '@angular/core/testing';
import { AutomationApiService } from './automation-api.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

describe('AutomationApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [ HttpClient, HttpHandler, CookieService]
  }));

  it('should be created', () => {
    const service: AutomationApiService = TestBed.get(AutomationApiService);
    expect(service).toBeTruthy();
  });
});
