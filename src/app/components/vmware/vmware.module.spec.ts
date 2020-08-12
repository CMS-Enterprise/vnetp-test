import { async, TestBed } from '@angular/core/testing';
import { VmwareModule } from './vmware.module';

describe('VmwareModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [VmwareModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(VmwareModule).toBeDefined();
  });
});
