import { Injectable } from '@angular/core';
import { NetworkSecurityProfileRule } from '../models/network-security-profile-rule';
import { ServiceObject } from '../models/service-object';
import { ServiceObjectGroup } from '../models/service-object-group';
import { NetworkObject } from '../models/network-object';
import { NetworkObjectGroup } from '../models/network-object-group';
import { RuleLocation } from '../models/rule-location';

@Injectable({
  providedIn: 'root'
})
export class FirewallRuleService {

  constructor() { }

  /** Denormalizes Network Object by attaching directly to Firewall Rule, only required due to backend constraints. */
  public static mapNetworkObject(firewallRule: NetworkSecurityProfileRule, networkObjects: Array<NetworkObject>,
                                 ruleLocation: RuleLocation) {
    let ruleName: string;

    if (ruleLocation === RuleLocation.Source) {
      ruleName = firewallRule.SourceNetworkObject;
    } else if (ruleLocation === RuleLocation.Destination) {
      ruleName = firewallRule.DestinationNetworkObject;
     }

    const networkObject = networkObjects.find(n => n.Name === ruleName);

    if (networkObject) {
      if (ruleLocation === RuleLocation.Source) {
        firewallRule._sourceNetworkObject = Object.assign({}, networkObject);
      } else if (ruleLocation === RuleLocation.Destination) {
        firewallRule._destinationNetworkObject = Object.assign({}, networkObject);
      }
    } else if (!networkObject) {
      throw new Error('Unable to find Firewall Rule Network Object!');
    }
  }

  public static mapNetworkObjectGroup(firewallRule: NetworkSecurityProfileRule, networkObjectGroups: Array<NetworkObjectGroup>) {

  }

  public static mapServiceObject(firewallRule: NetworkSecurityProfileRule, serviceObjects: Array<ServiceObject>) {

  }

  public static mapServiceObjectGroup(firewallRule: NetworkSecurityProfileRule, serviceObjectGroups: Array<ServiceObjectGroup>) {

  }

  public static validateFirewallRules() {
    throw new Error('Not Implemented.');
  }
}
