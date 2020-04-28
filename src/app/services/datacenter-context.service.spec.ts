import { TestBed } from '@angular/core/testing';

import { DatacenterContextService } from './datacenter-context.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie-service';
import { RouterTestingModule } from '@angular/router/testing';

describe('DatacenterContextService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [DatacenterContextService, CookieService],
    }),
  );

  it('should be created', () => {
    const service: DatacenterContextService = TestBed.get(DatacenterContextService);
    expect(service).toBeTruthy();
  });
});
