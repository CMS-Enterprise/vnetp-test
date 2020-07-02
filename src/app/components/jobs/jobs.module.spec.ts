import { async, TestBed } from '@angular/core/testing';
import { JobsModule } from './jobs.module';

describe('JobsModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [JobsModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(JobsModule).toBeDefined();
  });
});
