/* tslint:disable:quotemark */
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';

import {
  SearchBarHelpText,
  NetworkDetailHelpText,
  SubnetsVlansHelpText,
  SubnetModalHelpText,
  FirewallRulesHelpText,
  NatRulesHelpText,
  NetworkInterfacesHelpText,
  FirewallRuleModalHelpText,
  NatRuleModalHelpText,
  NetworkObjectsGroupsHelpText,
  NetworkObjectModalHelpText,
  NetworkObjectGroupModalHelpText,
  ServiceObjectsGroupsHelpText,
  ServiceObjectModalHelpText,
  VirtualServerModalHelpText,
  ServiceObjectGroupModalHelpText,
  PoolModalHelpText,
  NodeModalHelpText,
  IRuleModalHelpText,
  HealthMonitorModalHelpText,
  ContractModalHelpText,
  DashboardHelpText,
} from './help-text-networking';

describe('HelpTextService', () => {
  let searchBarHelpText: SearchBarHelpText;
  let networkDetailHelpText: NetworkDetailHelpText;
  let subnestVlansHelpText: SubnetsVlansHelpText;
  let subnetModalHelpText: SubnetModalHelpText;
  let firewallRulesHelpText: FirewallRulesHelpText;
  let natRulesHelpText: NatRulesHelpText;
  let networkInterfacesHelpText: NetworkInterfacesHelpText;
  let firewallRuleModalHelpText: FirewallRuleModalHelpText;
  let natRuleModalHelpText: NatRuleModalHelpText;
  let networkObjectsGroupsHelpText: NetworkObjectsGroupsHelpText;
  let networkObjectModalHelpText: NetworkObjectModalHelpText;
  let networkObjectGroupModalHelpText: NetworkObjectGroupModalHelpText;
  let serviceObjectsGroupsHelpText: ServiceObjectsGroupsHelpText;
  let serviceObjectModalHelpText: ServiceObjectModalHelpText;
  let serviceObjectGroupModalHelpText: ServiceObjectGroupModalHelpText;
  let virtualServerModalHelpText: VirtualServerModalHelpText;
  let poolModalHelpText: PoolModalHelpText;
  let nodeModalHelpText: NodeModalHelpText;
  let iRuleModalHelpText: IRuleModalHelpText;
  let healthMonitorModalHelpText: HealthMonitorModalHelpText;
  let contractModalHelpText: ContractModalHelpText;
  let dashboardHelpText: DashboardHelpText;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    searchBarHelpText = TestBed.inject(SearchBarHelpText);
    networkDetailHelpText = TestBed.inject(NetworkDetailHelpText);
    subnestVlansHelpText = TestBed.inject(SubnetsVlansHelpText);
    subnetModalHelpText = TestBed.inject(SubnetModalHelpText);
    firewallRulesHelpText = TestBed.inject(FirewallRulesHelpText);
    natRulesHelpText = TestBed.inject(NatRulesHelpText);
    networkInterfacesHelpText = TestBed.inject(NetworkInterfacesHelpText);
    firewallRuleModalHelpText = TestBed.inject(FirewallRuleModalHelpText);
    natRuleModalHelpText = TestBed.inject(NatRuleModalHelpText);
    networkObjectsGroupsHelpText = TestBed.inject(NetworkObjectsGroupsHelpText);
    networkObjectModalHelpText = TestBed.inject(NetworkObjectModalHelpText);
    networkObjectGroupModalHelpText = TestBed.inject(NetworkObjectGroupModalHelpText);
    serviceObjectsGroupsHelpText = TestBed.inject(ServiceObjectsGroupsHelpText);
    serviceObjectModalHelpText = TestBed.inject(ServiceObjectModalHelpText);
    virtualServerModalHelpText = TestBed.inject(VirtualServerModalHelpText);
    serviceObjectGroupModalHelpText = TestBed.inject(ServiceObjectGroupModalHelpText);
    poolModalHelpText = TestBed.inject(PoolModalHelpText);
    nodeModalHelpText = TestBed.inject(NodeModalHelpText);
    iRuleModalHelpText = TestBed.inject(IRuleModalHelpText);
    healthMonitorModalHelpText = TestBed.inject(HealthMonitorModalHelpText);
    contractModalHelpText = TestBed.inject(ContractModalHelpText);
    dashboardHelpText = TestBed.inject(DashboardHelpText);
  });

  it('should create SearchBarHelpText service', () => {
    expect(searchBarHelpText).toBeTruthy();
  });

  it('should create NetworkDetailHelpText service', () => {
    expect(networkDetailHelpText).toBeTruthy();
  });

  describe('SearchBarHelpText', () => {
    it('should have CaseSensitive property', () => {
      expect(searchBarHelpText.CaseSensitive).toEqual('Search parameters are case sensitive!');
    });
  });

  describe('NetworkDetailHelpText', () => {
    it('should have Vrf property', () => {
      expect(networkDetailHelpText.Vrf).toEqual('Tier (VRF) that the subnet is in.');
    });

    it('should have Deployed property', () => {
      expect(networkDetailHelpText.Deployed).toEqual('Deployment state of the subnet.');
    });

    it('should have VlanId property', () => {
      expect(networkDetailHelpText.VlanId).toEqual('VLAN ID associated with the Subnet.');
    });

    it('should have IpAddresses property', () => {
      expect(networkDetailHelpText.IpAddresses).toEqual('IP Addresses within the Subnet.');
    });

    it('should have Contracts property', () => {
      expect(networkDetailHelpText.Contracts).toEqual('Contracts assigned to the Subnet as Consumer and/or Provider.');
    });
  });

  describe('SubnestVlansHelpText', () => {
    it('should have correct Subnets help text', () => {
      expect(subnestVlansHelpText.Subnets).toEqual('IPv4/IPv6 Subnets within the selected Tier.');
    });

    it('should have correct Vlans help text', () => {
      expect(subnestVlansHelpText.Vlans).toEqual('VLANs within the selected Tier.');
    });

    it('should have correct Tier help text', () => {
      expect(subnestVlansHelpText.Tier).toEqual('Tier that Subnets and VLANs are created within.');
    });
  });

  describe('SubnetModalHelpText', () => {
    it('should create an instance', () => {
      expect(subnetModalHelpText).toBeTruthy();
    });

    it('should have correct help text for Vrf', () => {
      expect(subnetModalHelpText.Vrf).toEqual('Tier (VRF) that the subnet will be created within.');
    });

    it('should have correct help text for Protocol', () => {
      expect(subnetModalHelpText.Protocol).toEqual('IP Protocol of the Subnet.');
    });

    it('should have correct help text for Network', () => {
      expect(subnetModalHelpText.Network).toEqual('CIDR Address (X.X.X.X/YY) of the Subnet.');
    });

    it('should have correct help text for Gateway', () => {
      expect(subnetModalHelpText.Gateway).toEqual('Gateway Address of the Subnet.');
    });

    it('should have correct help text for Vlan', () => {
      expect(subnetModalHelpText.Vlan).toEqual('VLAN associated with the Subnet.');
    });

    it('should have correct help text for SharedBetweenVrfs', () => {
      expect(subnetModalHelpText.SharedBetweenVrfs).toEqual('Enable if instructed to enable by DRaaS team.');
    });
  });

  describe('FirewallRulesHelpText', () => {
    it('should be created', () => {
      expect(firewallRulesHelpText).toBeTruthy();
    });

    it('should have the correct Vrf help text', () => {
      expect(firewallRulesHelpText.Vrf).toEqual('Tier (VRF) that Network Objects & Groups are created within.');
    });

    it('should have the correct External help text', () => {
      expect(firewallRulesHelpText.External).toEqual('Firewall Rules between a Tier and CMSnet/Internet.');
    });

    it('should have the correct InterVrf help text', () => {
      expect(firewallRulesHelpText.InterVrf).toEqual('Firewall Rules between 2 Tiers.');
    });

    it('should have the correct IntraVrf help text', () => {
      expect(firewallRulesHelpText.IntraVrf).toEqual('Contracts between Subnets in the same Tier.');
    });
  });

  describe('NatRulesHelpText', () => {
    it('should create', () => {
      expect(natRulesHelpText).toBeTruthy();
    });

    it('should have correct External help text', () => {
      expect(natRulesHelpText.External).toEqual('NAT Rules between a Tier and CMSnet/Internet.');
    });

    it('should have correct InterVrf help text', () => {
      expect(natRulesHelpText.InterVrf).toEqual('NAT Rules between 2 Tiers.');
    });
  });

  describe('NetworkInterfacesHelpText', () => {
    it('should be created', () => {
      expect(networkInterfacesHelpText).toBeTruthy();
    });

    it('should have the correct properties', () => {
      expect(networkInterfacesHelpText.Vrf).toBe('Tier (VRF) that Network Objects & Groups are created within.');
      expect(networkInterfacesHelpText.Interfaces).toBe('Define Logical Interfaces and subnets allowed across them.');
    });
  });

  describe('FirewallRuleModalHelpText', () => {
    it('should create', () => {
      expect(firewallRuleModalHelpText).toBeTruthy();
    });

    it('should have the correct Name help text', () => {
      expect(firewallRuleModalHelpText.Name).toEqual('Name of the Firewall Rule.');
    });

    it('should have the correct Action help text', () => {
      expect(firewallRuleModalHelpText.Action).toEqual('Action that the firewall will take on traffic that matches this rule.');
    });

    it('should have the correct Direction help text', () => {
      expect(firewallRuleModalHelpText.Direction).toEqual(
        "Direction that this traffic flow will take. 'In' represents traffic entering the VRF from external/intervrf and 'Out' represents traffic leaving the VRF to external/intervrf.",
      );
    });

    it('should have the correct Protocol help text', () => {
      expect(firewallRuleModalHelpText.Protocol).toEqual('Layer 4 Protocol that matching traffic uses.');
    });

    it('should have the correct Enabled help text', () => {
      expect(firewallRuleModalHelpText.Enabled).toEqual('Indicates whether the firewall rule is enabled.');
    });

    it('should have the correct Logging help text', () => {
      expect(firewallRuleModalHelpText.Logging).toEqual('Indicates whether traffic that matches this rule should be logged.');
    });

    it('should have the correct SourceNetworkType help text', () => {
      expect(firewallRuleModalHelpText.SourceNetworkType).toEqual('Type of Source Network (IP, Object, Object Group).');
    });

    it('should have the correct SourceServiceType help text', () => {
      expect(firewallRuleModalHelpText.SourceServiceType).toEqual('Type of Source Service (Port/Port Range, Object, Object Group).');
    });

    it('should have the correct DestinationNetworkType help text', () => {
      expect(firewallRuleModalHelpText.DestinationNetworkType).toEqual('Type of Destination Network (IP, Object, Object Group).');
    });

    it('should have the correct DestinationServiceType help text', () => {
      expect(firewallRuleModalHelpText.DestinationServiceType).toEqual(
        'Type of Destination Service (Port/Port Range, Object, Object Group).',
      );
    });

    it('should have the correct IpNetworkType help text', () => {
      expect(firewallRuleModalHelpText.IpNetworkType).toEqual('IP address of a single host (X.X.X.X) or subnet (X.X.X.X/YY).');
    });

    it('should have the correct NetworkObjectType help text', () => {
      expect(firewallRuleModalHelpText.NetworkObjectType).toEqual('Network Object created under IPAM.');
    });

    it('should have the correct NetworkObjectGroupType help text', () => {
      expect(firewallRuleModalHelpText.NetworkObjectGroupType).toEqual('Network Object Group created under IPAM.');
    });

    it('should have the correct PortServiceType help text', () => {
      expect(firewallRuleModalHelpText.PortServiceType).toEqual("Single port (80), Range of ports (22-23) or 'any' to match any Port.");
    });

    it('should have the correct ServiceObjectType help text', () => {
      expect(firewallRuleModalHelpText.ServiceObjectType).toEqual('Service Object created under IPAM.');
    });

    it('should have the correct ServiceObjectGroupType help text', () => {
      expect(firewallRuleModalHelpText.ServiceObjectGroupType).toEqual('Service Object Group created under IPAM.');
    });

    it('should have the correct RuleIndex help text', () => {
      expect(firewallRuleModalHelpText.RuleIndex).toContain(
        'Index of the rule relative to other rules in the ruleset. Rules with a lower index will be applied first.',
      );
    });
  });

  describe('NatRuleModalHelpText', () => {
    it('should have the correct Name help text', () => {
      expect(natRuleModalHelpText.Name).toEqual('Name of the NAT rule.');
    });

    it('should have the correct Direction help text', () => {
      expect(natRuleModalHelpText.Direction).toEqual(
        "Direction that this traffic flow will take. 'In' represents traffic entering the VRF from external/intervrf and 'Out' represents traffic leaving the VRF to external/intervrf.",
      );
    });

    it('should have the correct Bidirectional help text', () => {
      expect(natRuleModalHelpText.Bidirectional).toEqual(`Indicates whether the NAT rule applies to traffic in both Directions.
  <br>
  <p>Constraints:</p>
  <p>*Bi-directional must be False when Translation Type is not Static.</p>
  <p>*Bi-directional must be False when a rule has Source and Destination Address translation.</p>
  `);
    });

    it('should have the correct Enabled help text', () => {
      expect(natRuleModalHelpText.Enabled).toEqual('Indicates whether the NAT rule is enabled.');
    });

    it('should have the correct Logging help text', () => {
      expect(natRuleModalHelpText.Logging).toEqual('Indicates whether traffic that matches this rule should be logged.');
    });

    it('should have the correct OriginalServiceType help text', () => {
      expect(natRuleModalHelpText.OriginalServiceType).toEqual('Type of Original Service (None, Service Object).');
    });

    it('should have the correct OriginalSourceAddressType help text', () => {
      expect(natRuleModalHelpText.OriginalSourceAddressType).toEqual('Type of Original Source Address (None, Object, Object Group)');
    });

    it('should have the correct OriginalDestinationAddressType help text', () => {
      expect(natRuleModalHelpText.OriginalDestinationAddressType).toEqual(`Type of Original Destination Address (None, Object, Object Group)
  <br>
  <p>Constraints:</p>
  <p>*When a translated destination address type is not 'None', the original destination address must also not be 'None'.</p>
  `);
    });

    it('should have the correct TranslationType help text', () => {
      expect(natRuleModalHelpText.TranslationType).toEqual(`NAT Translation Type (Static, DynamicIp, DynamicIpAndPort).
  <br>
  <p>Constraints:</p>
  <p>*Translated Source and Destination Network Object Groups are not allowed with Static Translation Type.</p>
  <p>*Translated Source and Destination Network Objects/Object Groups must be provided with DynamicIp or DynamicIpAndPort Translation Types.</p>
  `);
    });

    it('should have the correct TranslatedSourceAddressType help text', () => {
      expect(natRuleModalHelpText.TranslatedSourceAddressType).toEqual(`Type of Translated Source Address (None, Object, Object Group).
  <br>
  <p>Constraints:</p>
  <p>When translation type is dynamicIp or dynamicIpAndPort translatedSourceAddress MUST NOT be 'None'</p>`);
    });
    it('should have the correct TranslatedDestinationAddressType help text', () => {
      expect(natRuleModalHelpText.TranslatedDestinationAddressType).toEqual(
        'Type of Translated Destination Address (None, Object, Object Group).',
      );
    });

    it('should have the correct RuleIndex help text', () => {
      expect(natRuleModalHelpText.RuleIndex)
        .toEqual(`<p>Index of the rule relative to other rules in the ruleset. Rules with a lower index will be applied first.</p>
  <p>We auto-suggest the next available Rule Index in the rule list, please ensure this auto-suggestion does not place this rule behind any deny rules that may exist at the end of an ACL</p>`);
    });

    it('should have the correct TranslatedServiceType help text', () => {
      expect(natRuleModalHelpText.TranslatedServiceType).toEqual(
        "Type of Destination Service (None, Service Object). Note that if a Service Object is chosen, the Service Object must have a source port that is not 'any' or a range.",
      );
    });
  });

  describe('NetworkObjectsGroupsHelpText', () => {
    it('should create an instance', () => {
      expect(networkObjectsGroupsHelpText).toBeTruthy();
    });

    it('should have the correct Tier help text', () => {
      expect(networkObjectsGroupsHelpText.Tier).toEqual('Tier that Network Objects & Groups are created within.');
    });

    it('should have the correct NetworkObjects help text', () => {
      expect(networkObjectsGroupsHelpText.NetworkObjects).toEqual(
        'Network Objects can consist of a single host (with NAT/PAT), range or subnet.',
      );
    });

    it('should have the correct NetworkObjectGroups help text', () => {
      expect(networkObjectsGroupsHelpText.NetworkObjectGroups).toEqual('Network Object Groups are a collection of Network Objects.');
    });
  });

  describe('NetworkObjectModalHelpText', () => {
    it('should have the correct Name help text', () => {
      expect(networkObjectModalHelpText.Name).toEqual('Name of the Network Object.');
    });

    it('should have the correct Type help text', () => {
      expect(networkObjectModalHelpText.Type).toEqual('Type of Network Object (IpAddress, Range, FQDN).');
    });

    it('should have the correct Fqdn help text', () => {
      expect(networkObjectModalHelpText.Fqdn).toEqual('Fully-Qualified Domain Name of the Network Object.');
    });

    it('should have the correct IpAddress help text', () => {
      expect(networkObjectModalHelpText.IpAddress).toEqual('Ip Address/Subnet of the Network Object.');
    });

    it('should have the correct StartIpAddress help text', () => {
      expect(networkObjectModalHelpText.StartIpAddress).toEqual('Start Address (X.X.X.X) of Range Network Object.');
    });

    it('should have the correct EndIpAddress help text', () => {
      expect(networkObjectModalHelpText.EndIpAddress).toEqual('End Address (X.X.X.X) of Range Network Object.');
    });

    it('should have the correct Nat help text', () => {
      expect(networkObjectModalHelpText.Nat).toEqual('Sets whether Network Object should be NATed.');
    });

    it('should have the correct NatType help text', () => {
      expect(networkObjectModalHelpText.NatType).toEqual(
        'Type of NAT translation, InterVRF creates a translation between two Tiers, External creates a translation between a Tier and External.',
      );
    });

    it('should have the correct NatDirection help text', () => {
      expect(networkObjectModalHelpText.NatDirection).toEqual(
        'Direction of the NAT translation, "In" applies the translation to traffic entering the Tier, "Out" applies the translation to traffic exiting the Tier.',
      );
    });

    it('should have the correct TranslatedIpAddress help text', () => {
      expect(networkObjectModalHelpText.TranslatedIpAddress).toEqual(
        'IP address that a network object with NAT enabled will be translated to when it traverses between the two zones.',
      );
    });

    it('should have the correct NatService help text', () => {
      expect(networkObjectModalHelpText.NatService).toEqual('Sets whether Network Object should be PATed.');
    });

    it('should have the correct NatProtocol help text', () => {
      expect(networkObjectModalHelpText.NatProtocol).toEqual('Protocol (TCP/UDP) that traffic must match in order to NAT.');
    });

    it('should have the correct NatSourcePort help text', () => {
      expect(networkObjectModalHelpText.NatSourcePort).toEqual('Source Port that traffic must match in order to PAT.');
    });

    it('should have the correct NatTranslatedPort help text', () => {
      expect(networkObjectModalHelpText.NatTranslatedPort).toEqual('Port that traffic is PATed to.');
    });
  });

  describe('NetworkObjectGroupModalHelpText', () => {
    it('should have the correct Name help text', () => {
      expect(networkObjectGroupModalHelpText.Name).toEqual('Name of Network Object Group.');
    });

    it('should have the correct Description help text', () => {
      expect(networkObjectGroupModalHelpText.Description).toEqual('Description of Network Object Group.');
    });

    it('should have the correct NetworkObjects help text', () => {
      expect(networkObjectGroupModalHelpText.NetworkObjects).toEqual('Network Objects in the Network Object Group.');
    });
  });

  describe('ServiceObjectsGroupsHelpText', () => {
    it('should create', () => {
      expect(serviceObjectsGroupsHelpText).toBeDefined();
    });

    it('should have the correct Tier help text', () => {
      expect(serviceObjectsGroupsHelpText.Tier).toEqual('Tier that Service Objects & Groups are created within.');
    });

    it('should have the correct ServiceObjects help text', () => {
      expect(serviceObjectsGroupsHelpText.ServiceObjects).toEqual('Service Objects consist of a source and destination ports.');
    });

    it('should have the correct ServiceObjectGroups help text', () => {
      expect(serviceObjectsGroupsHelpText.ServiceObjectGroups).toEqual('Service Object Groups are a collection of Service Objects.');
    });
  });

  describe('ServiceObjectModalHelpText', () => {
    it('should have the correct Name help text', () => {
      expect(serviceObjectModalHelpText.Name).toEqual('Name of Service Object.');
    });

    it('should have the correct Type help text', () => {
      expect(serviceObjectModalHelpText.Type).toEqual('Type of Service Object (TCP, UDP). Cannot be changed after creation.');
    });

    it('should have the correct Port help text', () => {
      expect(serviceObjectModalHelpText.Port).toEqual("Single Port (80) or Port Range (22-23) or 'any' to match any Port.");
    });
  });

  describe('ServiceObjectGroupModalHelpText', () => {
    it('should have the correct Name help text', () => {
      expect(serviceObjectGroupModalHelpText.Name).toEqual('Name of Service Object Group.');
    });

    it('should have the correct Type help text', () => {
      expect(serviceObjectGroupModalHelpText.Type).toEqual(
        'Type of the Service Object Group (TCP, UDP, TCP/UDP). Cannot be changed after creation.',
      );
    });

    it('should have the correct Description help text', () => {
      expect(serviceObjectGroupModalHelpText.Description).toEqual('Description of the Service Object Group.');
    });

    it('should have the correct ServiceObjects help text', () => {
      expect(serviceObjectGroupModalHelpText.ServiceObjects).toEqual('Service Objects in the Service Object Group.');
    });
  });

  describe('VirtualServerHelpText', () => {
    it('should have the correct SourceAddress help text', () => {
      expect(virtualServerModalHelpText.SourceAddress).toEqual('Address or Network that the Virtual Server accepts traffic from.');
    });

    it('should have the correct SourceAddressTranslation help text', () => {
      expect(virtualServerModalHelpText.SourceAddressTranslation).toEqual('Source Address type.');
    });

    it('should have the correct DestinationAddress help text', () => {
      expect(virtualServerModalHelpText.DestinationAddress).toEqual('Address that the Virtual Server accepts traffic at.');
    });

    it('should have the correct ServicePort help text', () => {
      expect(virtualServerModalHelpText.ServicePort).toEqual('Port that the Virtual Server listens on.');
    });

    it('should have the correct Pool help text', () => {
      expect(virtualServerModalHelpText.Pool).toEqual('Pool that the Virtual Server forwards the request to.');
    });

    it('should have the correct IRules help text', () => {
      expect(virtualServerModalHelpText.IRules).toEqual(
        'List of iRules that the Virtual Server evaluates incoming traffic against in a top-down fashion.',
      );
    });

    it('should have the correct AvailableProfiles help text', () => {
      expect(virtualServerModalHelpText.AvailableProfiles).toEqual('Client SSL profiles available (can select multiple).');
    });

    it('should have the correct AvailablePolicies help text', () => {
      expect(virtualServerModalHelpText.AvailablePolicies).toEqual('Policies available (can select multiple).');
    });
  });

  describe('PoolModalHelpText', () => {
    it('should have the correct LoadBalancingMethod help text', () => {
      expect(poolModalHelpText.LoadBalancingMethod).toEqual('Load Balancing Strategy used to distribute requests amongst members.');
    });

    it('should have the correct Ratio help text', () => {
      expect(poolModalHelpText.Ratio).toEqual('Ratio of traffic that will be sent to the node.');
    });

    it('should have the correct ServicePort help text', () => {
      expect(poolModalHelpText.ServicePort).toEqual('Port that the node provides service on.');
    });
  });

  describe('NodeModalHelpText', () => {
    it('should have the correct AutoPopulate help text', () => {
      expect(nodeModalHelpText.AutoPopulate).toEqual('Determines whether the pool member will be auto-populated from the FQDN.');
    });
  });

  describe('IRuleModalHelpText', () => {
    it('should create', () => {
      expect(iRuleModalHelpText).toBeTruthy();
    });

    it('should have the correct Content help text', () => {
      expect(iRuleModalHelpText.Content).toEqual('iRule content in valid F5 format.');
    });
  });

  describe('HealthMonitorModalHelpText', () => {
    it('should create', () => {
      expect(healthMonitorModalHelpText).toBeTruthy();
    });

    it('should have the correct ServicePort help text', () => {
      expect(healthMonitorModalHelpText.ServicePort).toEqual('Port that Health Monitor attempts to connect to.');
    });

    it('should have the correct Interval help text', () => {
      expect(healthMonitorModalHelpText.Interval).toEqual('Interval that Health Monitor performs checks.');
    });

    it('should have the correct Timeout help text', () => {
      expect(healthMonitorModalHelpText.Timeout).toEqual('Timeout for checks before considering them failed.');
    });
  });

  describe('ContractModalHelpText', () => {
    it('should create', () => {
      expect(contractModalHelpText).toBeDefined();
    });

    it('should have the correct Name help text', () => {
      expect(contractModalHelpText.Name).toEqual('Contract Name.');
    });

    it('should have the correct Description help text', () => {
      expect(contractModalHelpText.Description).toEqual('Contract Description.');
    });

    it('should have the correct FilterEntries help text', () => {
      expect(contractModalHelpText.FilterEntries).toEqual('Filter Entries to allow specific traffic.');
    });
  });

  describe('DashboardHelpText', () => {
    it('should have the correct Datacenters help text', () => {
      expect(dashboardHelpText.Datacenters).toEqual('Total Datacenters within the current tenant.');
    });

    it('should have the correct Tiers help text', () => {
      expect(dashboardHelpText.Tiers).toEqual('Total Tiers within the current tenant.');
    });

    it('should have the correct Vlans help text', () => {
      expect(dashboardHelpText.Vlans).toEqual('Total VLANs within the current tenant.');
    });

    it('should have the correct Subnets help text', () => {
      expect(dashboardHelpText.Subnets).toEqual('Total Subnets within the current tenant.');
    });

    it('should have the correct LbVirtualServers help text', () => {
      expect(dashboardHelpText.LbVirtualServers).toEqual('Total Load Balancer Virtual Servers within the current tenant.');
    });

    it('should have the correct VMwareVms help text', () => {
      expect(dashboardHelpText.VMwareVms).toEqual('Total VMware Virtual Machines within the current tenant.');
    });

    it('should have the correct ZvmLpars help text', () => {
      expect(dashboardHelpText.ZvmLpars).toEqual('Total z/VM LPARs within the current tenant.');
    });

    it('should have the correct ZosLpars help text', () => {
      expect(dashboardHelpText.ZosLpars).toEqual('Total z/OS LPARs within the current tenant.');
    });
  });
});
