import { TestBed } from '@angular/core/testing';

import { FirewallRuleService } from './firewall-rule.service';
import { NetworkObject } from '../models/network-object';
import { NetworkSecurityProfileRule } from '../models/network-security-profile-rule';
import { RuleLocation } from '../models/rule-location';

describe('FirewallRuleService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FirewallRuleService = TestBed.get(FirewallRuleService);
    expect(service).toBeTruthy();
  });

  it('should map source network object', () => {
    const networkObjects = [{Name: 'Test'}, {Name: 'Test2'}] as Array<NetworkObject>;
    const firewallRule = {Name: 'Allow Test2', SourceNetworkObject: 'Test2'} as NetworkSecurityProfileRule;

    FirewallRuleService.mapNetworkObject(firewallRule, networkObjects, RuleLocation.Source);

    expect(firewallRule._sourceNetworkObject).toBeTruthy();
    expect(firewallRule._sourceNetworkObject.Name === 'Test2').toBeTruthy();
  });

  it('should throw error with invalid network object', () => {
    const networkObjects = [{Name: 'Test'}, {Name: 'Test2'}] as Array<NetworkObject>;
    const firewallRule = {Name: 'Allow Test3', SourceNetworkObject: 'Test3'} as NetworkSecurityProfileRule;

    expect(() => {FirewallRuleService.mapNetworkObject(firewallRule, networkObjects, RuleLocation.Source) })
    .toThrowError('Unable to find Firewall Rule Network Object!');
  });
});
