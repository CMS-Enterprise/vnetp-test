import { async, TestBed } from '@angular/core/testing';
import { TiersModule } from './tiers.module';

describe('TiersModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TiersModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(TiersModule).toBeDefined();
  });
});
