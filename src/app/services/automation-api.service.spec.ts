import { TestBed } from '@angular/core/testing';

import { AutomationApiService } from './automation-api.service';

describe('AutomationApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AutomationApiService = TestBed.get(AutomationApiService);
    expect(service).toBeTruthy();
  });
});
