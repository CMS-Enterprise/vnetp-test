import { FirewallRule } from './firewall-rule';

describe('NetworkSecurityProfileRule', () => {
  it('should create an instance', () => {
    expect(new FirewallRule()).toBeTruthy();
  });
});
