import { TestBed } from '@angular/core/testing';

import { SolarisService } from './solaris-service.service';
import { HttpHandler, HttpClient } from '@angular/common/http';

describe('SolarisServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [HttpClient, HttpHandler]
  }));

  // it('should be created', () => {
  //   const service: SolarisService = TestBed.get(SolarisService);
  //   expect(service).toBeTruthy();
  // });
});
