import { async, TestBed } from '@angular/core/testing';
import { PhysicalServerModule } from './physical-server.module';

describe('PhysicalServerModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [PhysicalServerModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(PhysicalServerModule).toBeDefined();
  });
});
