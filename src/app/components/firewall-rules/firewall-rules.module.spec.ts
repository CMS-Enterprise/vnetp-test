import { async, TestBed } from '@angular/core/testing';
import { FirewallRulesModule } from './firewall-rules.module';

describe('FirewallRulesModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FirewallRulesModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(FirewallRulesModule).toBeDefined();
  });
});
