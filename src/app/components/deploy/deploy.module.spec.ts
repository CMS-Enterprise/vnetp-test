import { async, TestBed } from '@angular/core/testing';
import { DeployModule } from './deploy.module';

describe('DeployModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DeployModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(DeployModule).toBeDefined();
  });
});
