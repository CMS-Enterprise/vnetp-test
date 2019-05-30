import { TestBed } from '@angular/core/testing';

import { SolarisService } from './solaris-service.service';
import { HttpHandler, HttpClient } from '@angular/common/http';

describe('SolarisServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [HttpClient, HttpHandler]
  }));

  it('should be created', () => {
    const service: SolarisService = TestBed.get(SolarisService);
    expect(service).toBeTruthy();
  });

  it('should be created 2', () => {
    const service: SolarisService = TestBed.get(SolarisService);
    let test = [1, 2, 3 , 4 , 5, 5];
    let result = service.returnUnique(test);

    expect(result.length === 5).toBeTruthy();
    expect(result[4] === 5);
  });

});
