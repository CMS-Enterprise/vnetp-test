import { TestBed } from '@angular/core/testing';
import { AutomationApiService } from './automation-api.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AutomationApiService', () => {
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
    const service: AutomationApiService = TestBed.get(AutomationApiService);
    expect(service).toBeTruthy();
  });
});
