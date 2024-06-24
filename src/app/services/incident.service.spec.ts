import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IncidentService } from './incident.service';

describe('IncidentServiceService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    }),
  );

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    const service: IncidentService = TestBed.inject(IncidentService);
    expect(service).toBeTruthy();
  });
});
