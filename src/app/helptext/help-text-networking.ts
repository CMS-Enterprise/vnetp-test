// tslint:disable: max-line-length
import { Injectable, Inject } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NetworkDetailHelpText {
  Vrf = `Tier (VRF) that the subnet is in.`;
  Deployed = `Deployment state of the subnet.`;
  VlanId = `VLAN ID associated with the Subnet.`;
  IpAddresses = `IP Addresses within the Subnet.`;
  Contracts = `Contracts assigned to the Subnet as Consumer and/or Provider.`;
}

@Injectable({
  providedIn: 'root',
})
export class NetworkCreateHelpText {
  Name = `Name of the Subnet.`;
  Vrf = `Tier (VRF) that the subnet will be created within.`;
  Protocol = `IP Protocol of the Subnet.`;
  CidrAddress = `CIDR Address (X.X.X.X/YY) of the Subnet.`;
  VlanId = `VLAN ID associated with the Subnet.`;
}

@Injectable({
  providedIn: 'root',
})
export class LoadBalancersHelpText {
  wikiBase: string = environment.wikiBase;

  Vrf = `Tier (VRF) that Load Balancer configurations are created within.`;
  VirtualServers = `Manage Virtual Servers.`;
  Pools = `Manage Pools and Pool Members.`;
  IRules = `Manage iRules in F5 format. More info: <a href=${this.wikiBase}/load-balancer#iRules">wiki</a>`;
  HealthMonitors = `Manage Health Monitors.`;
}

@Injectable({
  providedIn: 'root',
})
export class FirewallRulesHelpText {
  wikiBase: string = environment.wikiBase;

  Vrf = `Tier (VRF) that Network Objects & Groups are created within.`;
  External = `Firewall Rules between a Tier and CMSnet/Internet.`;
  InterVrf = `Firewall Rules between 2 Tiers.`;
  IntraVrf = `Contracts between Subnets in the same Tier.`;
}

@Injectable({
  providedIn: 'root',
})
export class NetworkInterfacesHelpText {
  wikiBase: string = environment.wikiBase;

  Vrf = `Tier (VRF) that Network Objects & Groups are created within.`;
  Interfaces = `Define Logical Interfaces and subnets allowed across them.`;
}

@Injectable({
  providedIn: 'root',
})
export class FirewallRuleModalHelpText {
  wikiBase: string = environment.wikiBase;

  Name = 'Name of the Firewall Rule, 28 characters max.';
  Action = `Action that the firewall will take on traffic that matches this rule.`;
  Direction = `Direction that this traffic flow will take. 'In' represents traffic entering the VRF from external/intervrf and 'Out' represents traffic leaving the VRF to external/intervrf.`;
  Protocol = `Layer 4 Protocol that matching traffic uses.`;
  Logging = `Indicates whether traffic that matches this rule should be logged.`;
  SourceNetworkType = `Type of Source Network (IP, Object, Object Group). More info: <a href="${this.wikiBase}/ipam#Network_Groups">wiki</a>`;
  SourceServiceType = `Type of Source Service (Port/Port Range, Object, Object Group). More info: <a href="${this.wikiBase}/ipam#Network_Groups">wiki</a>`;
  DestinationNetworkType = `Type of Destination Network (IP, Object, Object Group). More info: <a href="${this.wikiBase}/ipam#Network_Groups">wiki</a>`;
  DestinationServiceType = `Type of Destination Service (Port/Port Range, Object, Object Group). More info: <a href="${this.wikiBase}/ipam#Network_Groups">wiki</a>`;
  IpNetworkType = `IP address of a single host (X.X.X.X), subnet (X.X.X.X/YY), or 'any' to match any IP Address.`;
  NetworkObjectType = `Network Object created under IPAM.`;
  NetworkObjectGroupType = `Network Object Group created under IPAM.`;
  PortServiceType = `Single port (80), Range of ports (22-23) or 'any' to match any Port.`;
  ServiceObjectType = `Service Object created under IPAM. <a href="${this.wikiBase}/ipam#Service_Groups">wiki</a>`;
  ServiceObjectGroupType = `Service Object Group created under IPAM.`;
  RuleIndex = `Index of the rule relative to other rules in the ruleset. Rules with a lower index will be applied first.`;
}

@Injectable({
  providedIn: 'root',
})
export class NetworkObjectsGroupsHelpText {
  wikiBase: string = environment.wikiBase;

  Tier = `Tier that Network Objects & Groups are created within.`;
  NetworkObjects = `Network Objects can consist of a single host (with NAT/PAT), range or subnet.`;
  NetworkObjectGroups = `Network Object Groups are a collection of Network Objects.`;
}

@Injectable({
  providedIn: 'root',
})
export class NetworkObjectModalHelpText {
  Name = 'Name of the Network Object.';
  Type = `Type of Network Object (IpAddress, Range).`;
  IpAddress = `Ip Address/Subnet the Network Object.`;
  StartIpAddress = `Start Address (X.X.X.X) of Range Network Object.`;
  EndIpAddress = `End Address (X.X.X.X) of Range Network Object.`;
  Nat = `Sets whether Network Object should be NATed.`;
  NatType =
    'Type of NAT translation, InterVRF creates a translation between two Tiers, External creates a translation between a Tier and External.';
  NatDirection =
    'Direction of the NAT translation, "In" applies the translation to traffic entering the Tier, "Out" applies the translation to traffic exiting the Tier.';
  TranslatedIpAddress =
    'IP address that a network object with NAT enabled will be translated to when it traverses between the two zones.';
  NatService = 'Sets whether Network Object should be PATed.';
  NatProtocol = 'Protocol (TCP/UDP) that traffic must match in order to NAT.';
  NatSourcePort = 'Source Port that traffic must match in order to PAT.';
  NatTranslatedPort = 'Port that traffic is PATed to.';
}

@Injectable({
  providedIn: 'root',
})
export class NetworkObjectGroupModalHelpText {
  Name = `Name of Network Object Group.`;
  Description = `Description of Network Object Group.`;
  NetworkObjects = 'Network Objects in the Network Object Group.';
}

@Injectable({
  providedIn: 'root',
})
export class ServiceObjectsGroupsHelpText {
  wikiBase: string = environment.wikiBase;

  Tier = `Tier that Service Objects & Groups are created within.`;
  ServiceObjects = `Service Objects consist of a source and destination ports.`;
  ServiceObjectGroups = `Service Object Groups are a collection of Service Objects.`;
}

@Injectable({
  providedIn: 'root',
})
export class ServiceObjectModalHelpText {
  Name = `Name of Service Object.`;
  Type = `Type of Service Object (TCP, UDP). Cannot be changed after creation.`;
  Port = `Single Port (80) or Port Range (22-23) or 'any' to match any Port.`;
}

@Injectable({
  providedIn: 'root',
})
export class ServiceObjectGroupModalHelpText {
  Name = `Name of Service Object Group.`;
  Type = `Type of the Service Object Group (TCP, UDP, TCP/UDP). Cannot be changed after creation.`;
  Description = `Description of the Service Object Group.`;
  ServiceObjects = `Service Objects in the Service Object Group.`;
}

@Injectable({
  providedIn: 'root',
})
export class VirtualServerModalHelpText {
  Name = `Name of Virtual Server.`;
  Type = `Type of Virtual Server.`;
  SourceAddress = `Address or Network that the Virtual Server accepts traffic from.`;
  DestinationAddress = `Address that the Virtual Server accepts traffic at.`;
  ServicePort = `Port that the Virtual Server listens on.`;
  Pool = `Pool that the Virtual Server forwards the request to.`;
  IRules = `List of iRules that the Virtual Server evaluates incoming traffic against in a top-down fashion.`;
}

@Injectable({
  providedIn: 'root',
})
export class PoolModalHelpText {
  Name = `Name of Pool.`;
  LoadBalancingMethod = `Load Balancing Strategy used to distribute requests amongst members.`;
  PoolMembers = `Members of the Pool.`;
  AvailableHealthMonitors = `Health Monitors that can be added to the Pool.`;
  SelectedHealthMonitors = `Health Monitors that have been added to the Pool.`;
}

@Injectable({
  providedIn: 'root',
})
export class PoolMemberModalHelpText {
  Name = `Name of Pool Member.`;
  Type = `Pool Member Type (FQDN, IP Address).`;
  IpAddress = `IP Address of Pool Member.`;
  Fqdn = `FQDN of Pool Member.`;
  ServicePort = `Port that the Pool Member is listening for requests on.`;
}

@Injectable({
  providedIn: 'root',
})
export class IRuleModalHelpText {
  wikiBase: string = environment.wikiBase;

  Name = `Name of iRule.`;
  Content = `iRule content in valid F5 format.`;
}

@Injectable({
  providedIn: 'root',
})
export class HealthMonitorModalHelpText {
  wikiBase: string = environment.wikiBase;

  Name = `Name of Health Monitor.`;
  Type = 'Health Monitor Type (TCP, HTTP, HTTPS).';
  ServicePort = 'Port that Health Monitor attempts to connect to.';
  Interval = 'Interval (seconds) that Health Monitor performs checks.';
  Timeout = 'Timeout (seconds) for checks before considering them failed.';
}

@Injectable({
  providedIn: 'root',
})
export class ContractModalHelpText {
  wikiBase: string = environment.wikiBase;

  Name = `Contract Name.`;
  Description = 'Contract Description.';
  FilterEntries = 'Filter Entries to allow specific traffic.';
}
