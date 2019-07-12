import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class HelpTextNetworking {
    wikiBase = environment.wikiBase;
    //Networking tool tip messages
    networkGroupText = `Group of network objects (IPs, DNS names, etc..).  More info: <a href="${this.wikiBase}/ipam#Network_Groups">wiki</a>`;
    networkPortGroupText = `Group of ports. More info: <a href="${this.wikiBase}/ipam#Service_Groups">wiki</a>`;

      //Load balancer tool tip messages
      loadBalancerIRuleText = `F5 LoadBalancer language to create rich rules.  More info: <a href=${this.wikiBase}/load-balancer#iRules">wiki</a>`;
}
