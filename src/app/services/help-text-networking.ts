// tslint:disable: max-line-length

import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class HelpTextNetworking {
    wikiBase = environment.wikiBase;

    // Firewall Rule Modal

    fwModalAction = `Action that the firewall will take on traffic that matches this rule.`;
    fwModalDirection = `Direction that this traffic flow will take. 'In' represents traffic entering the VRF from external/intervrf and 'Out' represents traffic leaving the VRF to external/intervrf.`;
    fwModalProtocol = `Layer 4 Protocol that matching traffic uses.`;
    fwModalLog = `Indicates whether traffic that matches this rule should be logged.`;

    fwModalSourceNetworkType = `Type of Source Network (IP, Object, Object Group). More info: <a href="${this.wikiBase}/ipam#Network_Groups">wiki</a>`;
    fwModalSourceServiceType = `Type of Source Service (Port/Port Range, Object, Object Group). More info: <a href="${this.wikiBase}/ipam#Network_Groups">wiki</a>`;

    fwModalDestinationNetworkType = `Type of Destination Network (IP, Object, Object Group). More info: <a href="${this.wikiBase}/ipam#Network_Groups">wiki</a>`;
    fwModalDestinationServiceType = `Type of Destination Service (Port/Port Range, Object, Object Group). More info: <a href="${this.wikiBase}/ipam#Network_Groups">wiki</a>`;

    fwModalIpNetworkType = `IP address of a single host (X.X.X.X), subnet (X.X.X.X/YY), or 'any' to match any IP Address.`;
    fwModalNetworkObjectType = `Network Object created under IPAM.`;
    fwModalNetworkObjectGroupType = `Network Object Group created under IPAM.`;

    fwModalPortServiceType = `Single port (80), Range of ports (22-23) or 'any' to match any Port.`;
    fwModalServiceObjectType = `Service Object created under IPAM. <a href="${this.wikiBase}/ipam#Service_Groups">wiki</a>`;
    fwModalServiceObjectGroupType = `Service Object Group created under IPAM.`;


    // Load balancer tool tip messages  
    loadBalancerIRuleText = `F5 LoadBalancer language to create rich rules.  More info: <a href=${this.wikiBase}/load-balancer#iRules">wiki</a>`;
}
