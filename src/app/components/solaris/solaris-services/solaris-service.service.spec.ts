import { TestBed } from '@angular/core/testing';

import { SolarisServiceService } from './solaris-service.service';

describe('SolarisServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SolarisServiceService = TestBed.get(SolarisServiceService);
    expect(service).toBeTruthy();
  });
});
