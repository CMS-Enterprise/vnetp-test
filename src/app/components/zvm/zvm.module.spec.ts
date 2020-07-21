import { async, TestBed } from '@angular/core/testing';
import { ZvmModule } from './zvm.module';

describe('ZvmModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ZvmModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(ZvmModule).toBeDefined();
  });
});
