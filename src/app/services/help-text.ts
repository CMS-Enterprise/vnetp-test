import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
  })
export class HelpText {
    wikiBase = environment.wikiBase;

    //Load balancer tool tip messages
    loadBalancerIRuleText = `F5 LoadBalancer language to create rich rules.  More info: <a href=${this.wikiBase}/load-balancer#iRules">wiki</a>`;
    
}
