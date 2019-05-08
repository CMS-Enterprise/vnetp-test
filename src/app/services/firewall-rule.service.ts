import { Injectable } from '@angular/core';
import { FirewallRule } from '../models/firewall-rule';
import { ServiceObject } from '../models/service-object';
import { ServiceObjectGroup } from '../models/service-object-group';
import { NetworkObject } from '../models/network-object';
import { NetworkObjectGroup } from '../models/network-object-group';
import { RuleLocation } from '../models/rule-location';
import { UniqueNameObject } from '../models/unique-name-object.interface';

@Injectable({
  providedIn: 'root'
})
export class FirewallRuleService {

  constructor() { }

  /** Denormalizes Network Object by attaching directly to Firewall Rule, only required due to backend constraints. */
  public static mapNetworkObject(firewallRule: FirewallRule, objectName: string, networkObjects: Array<NetworkObject>,
                                 ruleLocation: RuleLocation) {

    const networkObject = networkObjects.find(n => n.Name === objectName);

    if (networkObject) {
      if (ruleLocation === RuleLocation.Source) {
        firewallRule.SourceNetworkObject = Object.assign({}, networkObject);
      } else if (ruleLocation === RuleLocation.Destination) {
        firewallRule.DestinationNetworkObject = Object.assign({}, networkObject);
      }
    } else if (!networkObject) {
      throw new Error('Unable to find Network Object.');
    }
  }

    /** Denormalizes Network Object Group by attaching directly to Firewall Rule, only required due to backend constraints. */
  public static mapNetworkObjectGroup(firewallRule: FirewallRule, objectGroupName: string,
                                      networkObjectGroups: Array<NetworkObjectGroup>, ruleLocation: RuleLocation ) {
    const networkObjectGroup = networkObjectGroups.find(n => n.Name === objectGroupName);

    if (networkObjectGroup) {
      if (ruleLocation === RuleLocation.Source) {
        firewallRule.SourceNetworkObjectGroup = Object.assign({}, networkObjectGroup);
      } else if (ruleLocation === RuleLocation.Destination) {
        firewallRule.DestinationNetworkObjectGroup = Object.assign({}, networkObjectGroup);
      }
    } else if (!networkObjectGroup) {
      throw new Error('Unable to find Network Object Group.');
    }
  }

    /** Denormalizes Service Object by attaching directly to Firewall Rule, only required due to backend constraints. */
  public static mapServiceObject(firewallRule: FirewallRule, objectName: string,
                                 serviceObjects: Array<ServiceObject>, ruleLocation: RuleLocation) {
   const serviceObject = serviceObjects.find(s => s.Name === objectName);

   if (serviceObject) {
      if (ruleLocation === RuleLocation.Source) {
        firewallRule.SourceServiceObject = Object.assign({}, serviceObject);
      } else if (ruleLocation === RuleLocation.Destination) {
        firewallRule.DestinationServiceObject = Object.assign({}, serviceObject);
      }
    } else if (!serviceObject) {
      throw new Error('Unable to find Service Object.');
    }
  }

  /** Denormalizes Service Object Group by attaching directly to Firewall Rule, only required due to backend constraints. */
  public static mapServiceObjectGroup(firewallRule: FirewallRule, objectGroupName: string,
                                      serviceObjectGroups: Array<ServiceObjectGroup>, ruleLocation: RuleLocation) {
  const serviceObjectGroup = serviceObjectGroups.find(s => s.Name === objectGroupName);

  if (serviceObjectGroup) {
      if (ruleLocation === RuleLocation.Source) {
        firewallRule.SourceServiceObjectGroup = Object.assign({}, serviceObjectGroup);
      } else if (ruleLocation === RuleLocation.Destination) {
        firewallRule.DestinationServiceObjectGroup = Object.assign({}, serviceObjectGroup);
      }
    } else if (!serviceObjectGroup) {
      throw new Error('Unable to find Service Object Group.');
    }
  }

  public static validateFirewallRules() {
    throw new Error('Not Implemented.');
  }

  /** Validates that the provided unique name object is unique within a collection of unique name objects. */
  public static objectIsUnique(uniqueNameObject: UniqueNameObject, uniqueNameObjects: Array<UniqueNameObject>,
                               caseInsensitive = true): boolean {

    if (!uniqueNameObject || !uniqueNameObjects) {
      throw new Error('Empty object or object collection.');
    }

    for (const object of uniqueNameObjects) {
      let duplicate = false;

      if (caseInsensitive) {
        duplicate = uniqueNameObject.Name.toLowerCase() === object.Name.toLowerCase();
        } else if (!caseInsensitive) {
          duplicate = uniqueNameObject.Name === object.Name;
        }

      if (duplicate) {
          return false;
      }
    }

    return true;
  }
}
