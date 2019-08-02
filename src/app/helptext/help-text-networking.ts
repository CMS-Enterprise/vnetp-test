// tslint:disable: max-line-length

import { Injectable, Inject } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class HelpTextNetworking {
    wikiBase: string = environment.wikiBase;

    // Load balancer tool tip messages
    loadBalancerIRuleText = `F5 LoadBalancer language to create rich rules.  More info: <a href=${this.wikiBase}/load-balancer#iRules">wiki</a>`;
}

@Injectable({
    providedIn: 'root'
})
export class FirewallRuleModalHelpText {
    wikiBase: string = environment.wikiBase;

    Name = 'Name of the Firewall Rule, 28 characters max.';
    Action = `Action that the firewall will take on traffic that matches this rule.`;
    Direction = `Direction that this traffic flow will take. 'In' represents traffic entering the VRF from external/intervrf and 'Out' represents traffic leaving the VRF to external/intervrf.`;
    Protocol = `Layer 4 Protocol that matching traffic uses.`;
    Log = `Indicates whether traffic that matches this rule should be logged.`;
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
}

@Injectable({
    providedIn: 'root'
})
export class NetworkObjectModalHelpText {
    wikiBase: string = environment.wikiBase;

    Name = 'Name of the Network Object.';
    Type = `Type of Network Object (Host, Range, Subnet).`;
    HostAddress = `Host Address (X.X.X.X) of Host Network Object.`;
    StartAddress = `Start Address (X.X.X.X) of Range Network Object.`;
    EndAddress = `End Address (X.X.X.X) of Range Network Object.`;
    CidrAddress = `Subnet (X.X.X.X/YY) of Subnet Network Object.`;
    Nat = `Sets whether Network Object should be NATed when traversing between the Source/Destination.`;
    Source = 'Traffic Source for a Network Object with NAT enabled.';
    Destination = 'ITraffic Destination for a Network Object with NAT enabled.';
    TranslatedIp = 'IP address that a network object with NAT enabled will be translated to when it traverses between the two zones.';
    NatService = 'Sets whether Network Object should be PATed when traversing between the Source/Destination.';
    NatProtocol = 'Protocol (TCP/UDP) that traffic must match in order to NAT.';
    SourcePort = 'Source Port that traffic must match in order to PAT.';
    TranslatedPort = 'Port that traffic is PATed to.';
}

@Injectable({
    providedIn: 'root'
})
export class NetworkObjectGroupModalHelpText {
    wikiBase: string = environment.wikiBase;

    Name = `Name of Network Object Group.`;
    Description = `Description of Network Object Group.`;
    NetworkObjects = 'Network Objects in the Network Object Group.';
}
