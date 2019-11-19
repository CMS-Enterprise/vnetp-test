import { TestBed } from '@angular/core/testing';
import { SolarisService } from './solaris-service.service';

describe('SolarisService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [SolarisService],
    }),
  );

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // it('should be created', () => {
  //   const service: SolarisService = TestBed.get(SolarisService);
  //   expect(service).toBeTruthy();
  // });
});
