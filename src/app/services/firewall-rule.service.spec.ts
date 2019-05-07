import { TestBed } from '@angular/core/testing';

import { FirewallRuleService } from './firewall-rule.service';
import { NetworkObject } from '../models/network-object';
import { NetworkSecurityProfileRule } from '../models/network-security-profile-rule';
import { RuleLocation } from '../models/rule-location';
import { NetworkObjectGroup } from '../models/network-object-group';
import { ServiceObject } from '../models/service-object';
import { ServiceObjectGroup } from '../models/service-object-group';

describe('FirewallRuleService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FirewallRuleService = TestBed.get(FirewallRuleService);
    expect(service).toBeTruthy();
  });

  // Network Object Mapping
  it('should map source network object', () => {
    const networkObjects = [{Name: 'Test'}, {Name: 'Test2'}] as Array<NetworkObject>;
    const firewallRule = {Name: 'Allow Test2'} as NetworkSecurityProfileRule;

    FirewallRuleService.mapNetworkObject(firewallRule, 'Test2', networkObjects, RuleLocation.Source);

    expect(firewallRule.SourceNetworkObject).toBeTruthy();
    expect(firewallRule.SourceNetworkObject.Name === 'Test2').toBeTruthy();
  });

  it('should map destination network object', () => {
    const networkObjects = [{Name: 'Test'}, {Name: 'Test2'}] as Array<NetworkObject>;
    const firewallRule = {Name: 'Allow Test2'} as NetworkSecurityProfileRule;

    FirewallRuleService.mapNetworkObject(firewallRule, 'Test2', networkObjects, RuleLocation.Destination);

    expect(firewallRule.DestinationNetworkObject).toBeTruthy();
    expect(firewallRule.DestinationNetworkObject.Name === 'Test2').toBeTruthy();
  });

  it('should throw error with invalid network object', () => {
    const firewallRule = {Name: 'Allow Test3'} as NetworkSecurityProfileRule;

    expect(() => {FirewallRuleService.mapNetworkObject(firewallRule, 'Test3', new Array<NetworkObject>(), RuleLocation.Destination); })
    .toThrowError('Unable to find Network Object.');
  });

  // Network Object Group Mapping
  it('should map source network object group', () => {
    const networkObjectGroups = [{Name: 'Test'}, {Name: 'Test2'}] as Array<NetworkObjectGroup>;
    const firewallRule = {Name: 'Allow Test2'} as NetworkSecurityProfileRule;

    FirewallRuleService.mapNetworkObjectGroup(firewallRule, 'Test2', networkObjectGroups, RuleLocation.Source);

    expect(firewallRule.SourceNetworkObjectGroup).toBeTruthy();
    expect(firewallRule.SourceNetworkObjectGroup.Name === 'Test2').toBeTruthy();
  });


  it('should map destination network object group', () => {
    const networkObjectGroups = [{Name: 'Test'}, {Name: 'Test2'}] as Array<NetworkObjectGroup>;
    const firewallRule = {Name: 'Allow Test2'} as NetworkSecurityProfileRule;

    FirewallRuleService.mapNetworkObjectGroup(firewallRule, 'Test2', networkObjectGroups, RuleLocation.Destination);

    expect(firewallRule.DestinationNetworkObjectGroup).toBeTruthy();
    expect(firewallRule.DestinationNetworkObjectGroup.Name === 'Test2').toBeTruthy();
  });

  it('should throw error with invalid network object group', () => {
    const firewallRule = {Name: 'Allow Test3'} as NetworkSecurityProfileRule;

    expect(() => {FirewallRuleService.mapNetworkObjectGroup(firewallRule, 'Test3', new Array<NetworkObjectGroup>(), RuleLocation.Source); })
    .toThrowError('Unable to find Network Object Group.');
  });

  // Map Service Object
  it('should map source service object', () => {
    const serviceObjects = [{Name: 'Test'}, {Name: 'Test2'}] as Array<ServiceObject>;
    const firewallRule = {Name: 'Allow Test2'} as NetworkSecurityProfileRule;

    FirewallRuleService.mapServiceObject(firewallRule, 'Test2', serviceObjects, RuleLocation.Source);

    expect(firewallRule.SourceServiceObject).toBeTruthy();
    expect(firewallRule.SourceServiceObject.Name === 'Test2').toBeTruthy();
  });

  it('should map destination service object', () => {
    const serviceObjects = [{Name: 'Test'}, {Name: 'Test2'}] as Array<ServiceObject>;
    const firewallRule = {Name: 'Allow Test2'} as NetworkSecurityProfileRule;

    FirewallRuleService.mapServiceObject(firewallRule, 'Test2', serviceObjects, RuleLocation.Destination);

    expect(firewallRule.DestinationServiceObject).toBeTruthy();
    expect(firewallRule.DestinationServiceObject.Name === 'Test2').toBeTruthy();
  });

  it('should throw error with invalid service object', () => {
    const firewallRule = {Name: 'Allow Test3'} as NetworkSecurityProfileRule

    expect(() => {FirewallRuleService.mapServiceObject(firewallRule, 'Test3', new Array<ServiceObject>(), RuleLocation.Destination); })
    .toThrowError('Unable to find Service Object.');
  });

  // Map Service Object Group
  it('should map source service object', () => {
    const serviceObjects = [{Name: 'Test'}, {Name: 'Test2'}] as Array<ServiceObject>;
    const firewallRule = {Name: 'Allow Test2'} as NetworkSecurityProfileRule;

    FirewallRuleService.mapServiceObject(firewallRule, 'Test2', serviceObjects, RuleLocation.Source);

    expect(firewallRule.SourceServiceObject).toBeTruthy();
    expect(firewallRule.SourceServiceObject.Name === 'Test2').toBeTruthy();
  });

  it('should map destination service object', () => {
    const serviceObjectGroups = [{Name: 'Test'}, {Name: 'Test2'}] as Array<ServiceObjectGroup>;
    const firewallRule = {Name: 'Allow Test2'} as NetworkSecurityProfileRule;

    FirewallRuleService.mapServiceObjectGroup(firewallRule, 'Test2', serviceObjectGroups, RuleLocation.Destination);

    expect(firewallRule.DestinationServiceObjectGroup).toBeTruthy();
    expect(firewallRule.DestinationServiceObjectGroup.Name === 'Test2').toBeTruthy();
  });

  it('should throw error with invalid service object', () => {
    const firewallRule = {Name: 'Allow Test3'} as NetworkSecurityProfileRule

    expect(() => {FirewallRuleService.mapServiceObjectGroup(firewallRule, 'Test3', new Array<ServiceObjectGroup>(), RuleLocation.Destination); })
    .toThrowError('Unable to find Service Object Group.');
  });

});
