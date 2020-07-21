import { async, TestBed } from '@angular/core/testing';
import { SubnetsVlansModule } from './subnets-vlans.module';

describe('SubnetsVlansModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SubnetsVlansModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(SubnetsVlansModule).toBeDefined();
  });
});
