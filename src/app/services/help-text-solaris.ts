import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})

export class HelpTextSolaris {
    wikiBase = environment.wikiBase;
    
    // Solaris tool tip messages
     solarisCdomCloneText = `Clone resources from previously configured host.  More info: <a href="${this.wikiBase}/solaris#CDOM_Create">Wiki</a>`;
     solarisLdomVnicText = `Required CDOM to inherit vSwitch. More info: <a href="${this.wikiBase}/solaris#LDOM_Create">wiki</a>`;
     solarisLdomVariableText = `Used to pass in variables to the LDOM automation scripts. More info: <a href="${this.wikiBase}/solaris#LDOM_Create">Wiki</a>`;
     solarisLdomNetInstallText = `Used to choose a image to apply to boot disk.  More info: <a href="${this.wikiBase}/solaris#LDOM_Create">wiki</a>`;
}
