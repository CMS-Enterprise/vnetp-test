import { async, TestBed } from '@angular/core/testing';
import { StaticRoutesModule } from './static-routes.module';

describe('StaticRoutesModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [StaticRoutesModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(StaticRoutesModule).toBeDefined();
  });
});
