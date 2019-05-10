import { TestBed } from '@angular/core/testing';
import { ObjectService } from './object.service';
import { NetworkObject } from '../models/network-object';
import { FirewallRule } from '../models/firewall-rule';
import { RuleLocation } from '../models/rule-location';
import { NetworkObjectGroup } from '../models/network-object-group';
import { ServiceObject } from '../models/service-object';
import { ServiceObjectGroup } from '../models/service-object-group';
import { UniqueNameObject } from '../models/unique-name-object.interface';

describe('FirewallRuleService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ObjectService = TestBed.get(ObjectService);
    expect(service).toBeTruthy();
  });

  // Network Object Mapping
  it('should map source network object', () => {
    const networkObjects = [{Name: 'Test'}, {Name: 'Test2'}] as Array<NetworkObject>;
    const firewallRule = {Name: 'Allow Test2'} as FirewallRule;

    ObjectService.mapNetworkObject(firewallRule, 'Test2', networkObjects, RuleLocation.Source);

    expect(firewallRule.SourceNetworkObject).toBeTruthy();
    expect(firewallRule.SourceNetworkObject.Name === 'Test2').toBeTruthy();
  });

  it('should map destination network object', () => {
    const networkObjects = [{Name: 'Test'}, {Name: 'Test2'}] as Array<NetworkObject>;
    const firewallRule = {Name: 'Allow Test2'} as FirewallRule;

    ObjectService.mapNetworkObject(firewallRule, 'Test2', networkObjects, RuleLocation.Destination);

    expect(firewallRule.DestinationNetworkObject).toBeTruthy();
    expect(firewallRule.DestinationNetworkObject.Name === 'Test2').toBeTruthy();
  });

  it('should throw error with invalid network object', () => {
    const firewallRule = {Name: 'Allow Test3'} as FirewallRule;

    expect(() => {ObjectService.mapNetworkObject(firewallRule, 'Test3', new Array<NetworkObject>(), RuleLocation.Destination); })
    .toThrowError('Unable to find Network Object.');
  });

  // Network Object Group Mapping
  it('should map source network object group', () => {
    const networkObjectGroups = [{Name: 'Test'}, {Name: 'Test2'}] as Array<NetworkObjectGroup>;
    const firewallRule = {Name: 'Allow Test2'} as FirewallRule;

    ObjectService.mapNetworkObjectGroup(firewallRule, 'Test2', networkObjectGroups, RuleLocation.Source);

    expect(firewallRule.SourceNetworkObjectGroup).toBeTruthy();
    expect(firewallRule.SourceNetworkObjectGroup.Name === 'Test2').toBeTruthy();
  });


  it('should map destination network object group', () => {
    const networkObjectGroups = [{Name: 'Test'}, {Name: 'Test2'}] as Array<NetworkObjectGroup>;
    const firewallRule = {Name: 'Allow Test2'} as FirewallRule;

    ObjectService.mapNetworkObjectGroup(firewallRule, 'Test2', networkObjectGroups, RuleLocation.Destination);

    expect(firewallRule.DestinationNetworkObjectGroup).toBeTruthy();
    expect(firewallRule.DestinationNetworkObjectGroup.Name === 'Test2').toBeTruthy();
  });

  it('should throw error with invalid network object group', () => {
    const firewallRule = {Name: 'Allow Test3'} as FirewallRule;

    expect(() => {ObjectService.mapNetworkObjectGroup(firewallRule, 'Test3', new Array<NetworkObjectGroup>(), RuleLocation.Source); })
    .toThrowError('Unable to find Network Object Group.');
  });

  // Map Service Object
  it('should map source service object', () => {
    const serviceObjects = [{Name: 'Test'}, {Name: 'Test2'}] as Array<ServiceObject>;
    const firewallRule = {Name: 'Allow Test2'} as FirewallRule;

    ObjectService.mapServiceObject(firewallRule, 'Test2', serviceObjects, RuleLocation.Source);

    expect(firewallRule.SourceServiceObject).toBeTruthy();
    expect(firewallRule.SourceServiceObject.Name === 'Test2').toBeTruthy();
  });

  it('should map destination service object', () => {
    const serviceObjects = [{Name: 'Test'}, {Name: 'Test2'}] as Array<ServiceObject>;
    const firewallRule = {Name: 'Allow Test2'} as FirewallRule;

    ObjectService.mapServiceObject(firewallRule, 'Test2', serviceObjects, RuleLocation.Destination);

    expect(firewallRule.DestinationServiceObject).toBeTruthy();
    expect(firewallRule.DestinationServiceObject.Name === 'Test2').toBeTruthy();
  });

  it('should throw error with invalid service object', () => {
    const firewallRule = {Name: 'Allow Test3'} as FirewallRule

    expect(() => {ObjectService.mapServiceObject(firewallRule, 'Test3', new Array<ServiceObject>(), RuleLocation.Destination); })
    .toThrowError('Unable to find Service Object.');
  });

  // Map Service Object Group
  it('should map source service object', () => {
    const serviceObjects = [{Name: 'Test'}, {Name: 'Test2'}] as Array<ServiceObject>;
    const firewallRule = {Name: 'Allow Test2'} as FirewallRule;

    ObjectService.mapServiceObject(firewallRule, 'Test2', serviceObjects, RuleLocation.Source);

    expect(firewallRule.SourceServiceObject).toBeTruthy();
    expect(firewallRule.SourceServiceObject.Name === 'Test2').toBeTruthy();
  });

  it('should map destination service object', () => {
    const serviceObjectGroups = [{Name: 'Test'}, {Name: 'Test2'}] as Array<ServiceObjectGroup>;
    const firewallRule = {Name: 'Allow Test2'} as FirewallRule;

    ObjectService.mapServiceObjectGroup(firewallRule, 'Test2', serviceObjectGroups, RuleLocation.Destination);

    expect(firewallRule.DestinationServiceObjectGroup).toBeTruthy();
    expect(firewallRule.DestinationServiceObjectGroup.Name === 'Test2').toBeTruthy();
  });

  it('should throw error with invalid service object', () => {
    const firewallRule = {Name: 'Allow Test3'} as FirewallRule

    expect(() => {ObjectService.mapServiceObjectGroup(firewallRule, 'Test3',
     new Array<ServiceObjectGroup>(), RuleLocation.Destination); })
    .toThrowError('Unable to find Service Object Group.');
  });

  it('should validate UNIQUE unique name objects (case-insensitive)', () => {
    const uniqueObjects = [{Name: 'test'}, {Name: 'TEST2'}, {Name: 'TeSt3'}] as Array<UniqueNameObject>;
    const uniqueObject = {Name: 'Test4'} as UniqueNameObject;

    const result = ObjectService.objectIsUnique(uniqueObject, uniqueObjects);

    expect(result).toBeTruthy();
  });


  it('should validate UNIQUE unique name object (case-sensitive)', () => {
    const uniqueObjects = [{Name: 'test'}, {Name: 'TEST2'}, {Name: 'TeSt3'}] as Array<UniqueNameObject>;
    const uniqueObject = {Name: 'Test2'} as UniqueNameObject;

    const result = ObjectService.objectIsUnique(uniqueObject, uniqueObjects, false);

    expect(result).toBeTruthy();
  });

  it('should validate NON-UNIQUE unique name objects (case-insensitive)', () => {
    const uniqueObjects = [{Name: 'test'}, {Name: 'TEST2'}, {Name: 'TeSt3'}] as Array<UniqueNameObject>;
    const uniqueObject = {Name: 'test2'} as UniqueNameObject;

    const result = ObjectService.objectIsUnique(uniqueObject, uniqueObjects);

    expect(result).toBeFalsy();
  });

  it('should validate NON-UNIQUE unique name object (case-sensitive)', () => {
    const uniqueObjects = [{Name: 'test'}, {Name: 'TEST2'}, {Name: 'TeSt3'}] as Array<UniqueNameObject>;
    const uniqueObject = {Name: 'TEST2'} as UniqueNameObject;

    const result = ObjectService.objectIsUnique(uniqueObject, uniqueObjects, false);

    expect(result).toBeFalsy();
  });

  it('should throw error with null source object', () => {
    const uniqueObjects = [{Name: 'test'}, {Name: 'TEST2'}, {Name: 'TeSt3'}] as Array<UniqueNameObject>;

    expect(() => {ObjectService.objectIsUnique(null, uniqueObjects); })
    .toThrowError('Null object or object collection.');
  });

  it('should throw error with null object collection', () => {
    const uniqueObject = {Name: ''} as UniqueNameObject;

    expect(() => {ObjectService.objectIsUnique(uniqueObject, null); })
    .toThrowError('Null object or object collection.');
  });

  it('should throw error with invalid object name (empty)', () => {
    const uniqueObjects = [{Name: 'test'}, {Name: 'TEST2'}, {Name: 'TeSt3'}] as Array<UniqueNameObject>;
    const uniqueObject = {Name: '   '} as UniqueNameObject;

    expect(() => {ObjectService.objectIsUnique(uniqueObject, uniqueObjects); })
    .toThrowError('Object must have a name.');
  });

  it('should throw error with invalid object name (null)', () => {
    const uniqueObjects = [{Name: 'test'}, {Name: 'TEST2'}, {Name: 'TeSt3'}] as Array<UniqueNameObject>;
    const uniqueObject = {Name: null} as UniqueNameObject;

    expect(() => {ObjectService.objectIsUnique(uniqueObject, uniqueObjects); })
    .toThrowError('Object must have a name.');
  });

});
