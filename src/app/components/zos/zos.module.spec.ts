import { async, TestBed } from '@angular/core/testing';
import { ZosModule } from './zos.module';

describe('ZosModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ZosModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(ZosModule).toBeDefined();
  });
});
