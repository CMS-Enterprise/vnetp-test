import { TestBed } from '@angular/core/testing';

import { AppIdRuntimeService } from './app-id-runtime.service';

describe('AppIdRuntimeService', () => {
  let service: AppIdRuntimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppIdRuntimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
