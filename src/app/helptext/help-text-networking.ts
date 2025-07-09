/* eslint-disable */
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SearchBarHelpText {
  CaseSensitive = 'Search parameters are case sensitive!';
}

@Injectable({
  providedIn: 'root',
})
export class FilteredCount {
  FilteredResults = `Items that match the search bar criteria`;
}

@Injectable({
  providedIn: 'root',
})
export class NetworkDetailHelpText {
  Vrf = 'Tier (VRF) that the subnet is in.';
  Deployed = 'Deployment state of the subnet.';
  VlanId = 'VLAN ID associated with the Subnet.';
  IpAddresses = 'IP Addresses within the Subnet.';
  Contracts = 'Contracts assigned to the Subnet as Consumer and/or Provider.';
}

@Injectable({
  providedIn: 'root',
})
export class SubnetsVlansHelpText {
  Subnets = 'IPv4/IPv6 Subnets within the selected Tier.';
  Vlans = 'VLANs within the selected Tier.';
  Tier = 'Tier that Subnets and VLANs are created within.';
}

@Injectable({
  providedIn: 'root',
})
export class SubnetModalHelpText {
  Vrf = 'Tier (VRF) that the subnet will be created within.';
  Protocol = 'IP Protocol of the Subnet.';
  Network = 'CIDR Address of the Subnet. (IPv4/IPv6)';
  Gateway = 'Gateway Address of the Subnet. (IPv4/IPv6)';
  Vlan = 'VLAN associated with the Subnet.';
  SharedBetweenVrfs = 'Enable if instructed to enable by DRaaS team.';
}

@Injectable({
  providedIn: 'root',
})
export class FirewallRulesHelpText {
  Vrf = `Tier (VRF) that Network Objects & Groups are created within.`;
  External = 'Firewall Rules between a Tier and CMSnet/Internet.';
  InterVrf = 'Firewall Rules between 2 Tiers.';
  IntraVrf = 'Contracts between Subnets in the same Tier.';
}

@Injectable({
  providedIn: 'root',
})
export class NatRulesHelpText {
  External = 'NAT Rules between a Tier and CMSnet/Internet.';
  InterVrf = 'NAT Rules between 2 Tiers.';
}

@Injectable({
  providedIn: 'root',
})
export class NetworkInterfacesHelpText {
  Vrf = 'Tier (VRF) that Network Objects & Groups are created within.';
  Interfaces = 'Define Logical Interfaces and subnets allowed across them.';
}

@Injectable({
  providedIn: 'root',
})
export class FirewallRuleModalHelpText {
  Name = 'Name of the Firewall Rule.';
  Action = 'Action that the firewall will take on traffic that matches this rule.';
  Direction =
    // eslint-disable-next-line
    "Direction that this traffic flow will take. 'In' represents traffic entering the VRF from external/intervrf and 'Out' represents traffic leaving the VRF to external/intervrf.";
  Protocol = 'Layer 4 Protocol that matching traffic uses.';
  Enabled = 'Indicates whether the firewall rule is enabled.';
  Logging = `Indicates whether traffic that matches this rule should be logged.`;
  SourceNetworkType = `Type of Source Network (IP, Object, Object Group).`;
  SourceServiceType = `Type of Source Service (Port/Port Range, Object, Object Group).`;
  DestinationNetworkType = `Type of Destination Network (IP, Object, Object Group).`;
  DestinationServiceType = `Type of Destination Service (Port/Port Range, Object, Object Group).`;
  IpNetworkType = `IP address of a single host or subnet. (IPv4/IPv6)`;
  NetworkObjectType = `Network Object created under IPAM.`;
  NetworkObjectGroupType = `Network Object Group created under IPAM.`;
  PortServiceType = `Single port (80), Range of ports (22-23) or 'any' to match any Port.`;
  ServiceObjectType = `Service Object created under IPAM.`;
  ServiceObjectGroupType = `Service Object Group created under IPAM.`;
  RuleIndex = `<p>Index of the rule relative to other rules in the ruleset. Rules with a lower index will be applied first.</p>
  <p>We auto-suggest the next available Rule Index in the rule list, please ensure this auto-suggestion does not place this rule behind any deny rules that may exist at the end of an ACL</p>`;
}

@Injectable({
  providedIn: 'root',
})
export class NatRuleModalHelpText {
  Name = 'Name of the NAT rule.';
  Direction =
    "Direction that this traffic flow will take. 'In' represents traffic entering the VRF from external/intervrf and 'Out' represents traffic leaving the VRF to external/intervrf.";
  Bidirectional = `Indicates whether the NAT rule applies to traffic in both Directions.
  <br>
  <p>Constraints:</p>
  <p>*Bi-directional must be False when Translation Type is not Static.</p>
  <p>*Bi-directional must be False when a rule has Source and Destination Address translation.</p>
  `;
  Enabled = 'Indicates whether the NAT rule is enabled.';
  Logging = `Indicates whether traffic that matches this rule should be logged.`;
  OriginalServiceType = `Type of Original Service (None, Service Object).`;
  OriginalSourceAddressType = `Type of Original Source Address (None, Object, Object Group)`;
  OriginalDestinationAddressType = `Type of Original Destination Address (None, Object, Object Group)
  <br>
  <p>Constraints:</p>
  <p>*When a translated destination address type is not 'None', the original destination address must also not be 'None'.</p>
  `;
  TranslationType = `NAT Translation Type (Static, DynamicIp, DynamicIpAndPort).
  <br>
  <p>Constraints:</p>
  <p>*Translated Source and Destination Network Object Groups are not allowed with Static Translation Type.</p>
  <p>*Translated Source and Destination Network Objects/Object Groups must be provided with DynamicIp or DynamicIpAndPort Translation Types.</p>
  `;
  TranslatedServiceType = `Type of Destination Service (None, Service Object). Note that if a Service Object is chosen, the Service Object must have a source port that is not 'any' or a range.`;
  TranslatedSourceAddressType = `Type of Translated Source Address (None, Object, Object Group).
  <br>
  <p>Constraints:</p>
  <p>When translation type is dynamicIp or dynamicIpAndPort translatedSourceAddress MUST NOT be 'None'</p>`;
  TranslatedDestinationAddressType = `Type of Translated Destination Address (None, Object, Object Group).`;
  RuleIndex = `<p>Index of the rule relative to other rules in the ruleset. Rules with a lower index will be applied first.</p>
  <p>We auto-suggest the next available Rule Index in the rule list, please ensure this auto-suggestion does not place this rule behind any deny rules that may exist at the end of an ACL</p>`;
}

@Injectable({
  providedIn: 'root',
})
export class NetworkObjectsGroupsHelpText {
  Tier = 'Tier that Network Objects & Groups are created within.';
  NetworkObjects = 'Network Objects can consist of a single host (with NAT/PAT), range or subnet.';
  NetworkObjectGroups = 'Network Object Groups are a collection of Network Objects.';
}

@Injectable({
  providedIn: 'root',
})
export class NetworkObjectModalHelpText {
  Name = 'Name of the Network Object.';
  Type = 'Type of Network Object (IpAddress, Range, FQDN).';
  Fqdn = 'Fully-Qualified Domain Name of the Network Object.';
  IpAddress = 'Ip Address/Subnet of the Network Object.';
  StartIpAddress = 'Start Address of Range Network Object. (IPv4/IPv6)';
  EndIpAddress = 'End Address of Range Network Object, must be greater than StartIpAddress. (IPv4/IPv6)';
  Nat = 'Sets whether Network Object should be NATed.';
  NatType =
    'Type of NAT translation, InterVRF creates a translation between two Tiers, External creates a translation between a Tier and External.';
  NatDirection =
    'Direction of the NAT translation, "In" applies the translation to traffic entering the Tier, "Out" applies the translation to traffic exiting the Tier.';
  TranslatedIpAddress = 'IP address that a network object with NAT enabled will be translated to when it traverses between the two zones.';
  NatService = 'Sets whether Network Object should be PATed.';
  NatProtocol = 'Protocol (TCP/UDP) that traffic must match in order to NAT.';
  NatSourcePort = 'Source Port that traffic must match in order to PAT.';
  NatTranslatedPort = 'Port that traffic is PATed to.';
}

@Injectable({
  providedIn: 'root',
})
export class NetworkObjectGroupModalHelpText {
  Name = 'Name of Network Object Group.';
  Description = 'Description of Network Object Group.';
  NetworkObjects = 'Network Objects in the Network Object Group.';
}

@Injectable({
  providedIn: 'root',
})
export class ServiceObjectsGroupsHelpText {
  Tier = 'Tier that Service Objects & Groups are created within.';
  ServiceObjects = 'Service Objects consist of a source and destination ports.';
  ServiceObjectGroups = 'Service Object Groups are a collection of Service Objects.';
}

@Injectable({
  providedIn: 'root',
})
export class ServiceObjectModalHelpText {
  Name = 'Name of Service Object.';
  Type = 'Type of Service Object (TCP, UDP). Cannot be changed after creation.';
  Port = "Single Port (80) or Port Range (22-23) or 'any' to match any Port.";
}

@Injectable({
  providedIn: 'root',
})
export class ServiceObjectGroupModalHelpText {
  Name = 'Name of Service Object Group.';
  Type = 'Type of the Service Object Group (TCP, UDP, TCP/UDP). Cannot be changed after creation.';
  Description = 'Description of the Service Object Group.';
  ServiceObjects = 'Service Objects in the Service Object Group.';
}

@Injectable({
  providedIn: 'root',
})
export class VirtualServerModalHelpText {
  SourceAddress = 'Address or Network that the Virtual Server accepts traffic from.';
  SourceAddressTranslation = 'Source Address type.';
  DestinationAddress = 'Address that the Virtual Server accepts traffic at.';
  ServicePort = 'Port that the Virtual Server listens on.';
  Pool = 'Pool that the Virtual Server forwards the request to.';
  IRules = 'List of iRules that the Virtual Server evaluates incoming traffic against in a top-down fashion.';
  AvailableProfiles = 'Client SSL profiles available (can select multiple).';
  AvailablePolicies = 'Policies available (can select multiple).';
}

@Injectable({
  providedIn: 'root',
})
export class PoolModalHelpText {
  LoadBalancingMethod = 'Load Balancing Strategy used to distribute requests amongst members.';
  Ratio = 'Ratio of traffic that will be sent to the node.';
  ServicePort = 'Port that the node provides service on.';
}

@Injectable({
  providedIn: 'root',
})
export class NodeModalHelpText {
  AutoPopulate = 'Determines whether the pool member will be auto-populated from the FQDN.';
}

@Injectable({
  providedIn: 'root',
})
export class IRuleModalHelpText {
  Content = 'iRule content in valid F5 format.';
}

@Injectable({
  providedIn: 'root',
})
export class HealthMonitorModalHelpText {
  ServicePort = 'Port that Health Monitor attempts to connect to.';
  Interval = 'Interval that Health Monitor performs checks.';
  Timeout = 'Timeout for checks before considering them failed.';
}

@Injectable({
  providedIn: 'root',
})
export class ContractModalHelpText {
  Name = 'Contract Name.';
  Description = 'Contract Description.';
  FilterEntries = 'Filter Entries to allow specific traffic.';
}

@Injectable({
  providedIn: 'root',
})
export class DashboardHelpText {
  Datacenters = 'Total Datacenters within the current tenant.';
  Tiers = 'Total Tiers within the current tenant.';
  Vlans = 'Total VLANs within the current tenant.';
  Subnets = 'Total Subnets within the current tenant.';
  LbVirtualServers = 'Total Load Balancer Virtual Servers within the current tenant.';
}

@Injectable({
  providedIn: 'root',
})
export class AppcentricDashboardHelpText {
  Tenants = 'Total Appcentric Tenants within the current tenant.';
  Vrfs = 'Total VRFs within the current tenant.';
  BridgeDomains = 'Total Bridge Domains within the current tenant.';
  Contracts = 'Total Contracts within the current tenant.';
}

@Injectable({
  providedIn: 'root',
})
export class TenantSelectModalHelpText {
  NorthSouthAppId = 'Allow PANOS App-ID (requires PANOS firewall vendor)';
  EastWestAppId = 'Allow PANOS App-ID (requires PANOS firewall vendor)';
  Nat64NorthSouth = 'Enable NAT64 and DNS64 functionality for IPv6-to-IPv4 communication on the north/south firewall';
  EastWestAllowSgBypass = 'Allows tenant to define additional contract subjects and filters that bypass the service graph';
  EastWestNat =
    'Create host subnets in source EPG when firewall performs source NAT and host subnets in dest EPG when firewall performs dest NAT';
  TenantSize =
    'X-Small: Small virtual firewall, limited VCD resources\n' +
    'Small: Basic virtual firewall, standard VCD resources\n' +
    'Medium: Mid-size virtual firewall, enhanced VCD resources\n' +
    'Large: High-capacity virtual firewall, advanced VCD resources\n' +
    'X-Large: Maximum capacity virtual firewall, premium VCD resources';
  HighAvailability = 'Enable redundant firewall deployment for high availability and failover protection';
  HAMode = 'Active-Passive: One active firewall with passive standby\nActive-Active: Both firewalls actively processing traffic';
  VendorAgnosticNat =
    'Adds a UI option when creating NAT rules that generates a corresponding firewall rule ' +
    'to match NAT traffic and uses a vendor-agnostic firewall automation strategy that ' +
    'handles differences in processing flow between ASA and PANOS';
  RegionalHA = 'Configure high availability across multiple datacenter regions';
  DeploymentMode =
    'Hot Site First: Deploy to primary site first, then secondary\nCold Site First: Deploy to secondary site first, then primary\nScheduled Sync: Schedule regular synchronization between sites\n\nNote: A failure in the secondary deployment will halt the workflow and rollback the changes to the secondary environment.';
  MultiVrf = 'Enable multiple VRFs within tenant.';
  MultiL3out = 'Enable multiple L3Outs within tenant VRFs.';
}
