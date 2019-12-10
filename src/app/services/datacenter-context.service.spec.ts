import { TestBed } from '@angular/core/testing';

import { DatacenterContextService } from './datacenter-context.service';

describe('DatacenterContextService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DatacenterContextService = TestBed.get(
      DatacenterContextService,
    );
    expect(service).toBeTruthy();
  });
});
