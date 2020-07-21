import { async, TestBed } from '@angular/core/testing';
import { LoadBalancersModule } from './load-balancers.module';

describe('LoadBalancersModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LoadBalancersModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(LoadBalancersModule).toBeDefined();
  });
});
