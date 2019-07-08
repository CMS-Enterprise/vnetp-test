import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
@Injectable({
    providedIn: 'root'
  })
export class HelpText {
    wikiBase = environment.wikiBase;
    //Networking tool tip messages
    networkGroupText = `Group of network objects (IPs, DNS names, etc..).  More info: ${this.wikiBase}ipam#NetworkGroups`
    
    // Solaris tool tip messages
    solarisCdomCloneText = `Clone resources from previously configured host.  More info: ${this.wikiBase}/solaris#CDOM_Create`;



}
