import { async, TestBed } from '@angular/core/testing';
import { ApplianceModule } from './appliance.module';

describe('ApplianceModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ApplianceModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(ApplianceModule).toBeDefined();
  });
});
