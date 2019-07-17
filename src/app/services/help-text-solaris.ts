import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})

export class HelpTextSolaris {
    wikiBase = environment.wikiBase;

    // Solaris CDOM tool tip messages
    solarisCdomCloneText = `Clone resources from previously configured host.  More info: <a href="${this.wikiBase}/solaris#CDOM_Create">Wiki</a>`;
    solarisCdomVswitchNameText = `Display name for this vSwitch`;
    solarisCdomVswitchLogicalInterfaceText = `Represents the logical interface presented to the vSwitch from underlying network.  More info: <a href="${this.wikiBase}/solaris#CDOM_Create">Wiki</a>`;
    solarisCdomVswitchTaggedVlanText = `Enter all VLAN ID which will be allowed through this vSwitch. More info: <a href="${this.wikiBase}/solaris#CDOM_Create">Wiki"</a>`;
    solarisCdomVswitchUnTaggedVlanText = `Untagged traffic to this vSwitch will be tagged with this VLAN ID. More info: <a href="${this.wikiBase}/solaris#CDOM_Create">Wiki</a>`;
    // tslint:disable-next-line: max-line-length
    solarisCdomVccPortsText = `Number of network ports to assign to the Virtual Console Concentrator. More info: <a href="${this.wikiBase}/solaris#CDOM_Create">Wiki</a>`;
    solarisCdomVswitchText = `Virtual network Switch associated with a logical interface.  More info: <a href=${this.wikiBase}/solaris#Virtual_Switch">Wiki</a>`;
    // solarisCdomAlternateVdsText = `Create Alterate CDOM and associated components`

    // Solaris LDOM tool tip messages
    solarisLdomVnicText = `Required CDOM to inherit vSwitch. More info: <a href="${this.wikiBase}/solaris#LDOM_Create">wiki</a>`;
    solarisLdomVariableText = `Used to pass in variables to the LDOM automation scripts. More info: <a href="${this.wikiBase}/solaris#LDOM_Create">Wiki</a>`;
    solarisLdomNetInstallText = `Used to choose a image to apply to boot disk.  More info: <a href="${this.wikiBase}/solaris#LDOM_Create">wiki</a>`;
    // tslint:disable-next-line: max-line-length
    solarisAssociatedCdomText = `Specifies the name of the CDOM that provides managment to this LDOM.  More info: <a href="${this.wikiBase}/solaris#LDOM_Create">Wiki</a>`;
    solarisLdomVnicTaggedVlanText = `Enter all VLAN ID which will be allowed through this vNic. More info: <a href="${this.wikiBase}/solaris#LDOM_Create">Wiki"</a>`;
    solarisLdomVnicUnTaggedVlanText = `Untagged traffic to this vNic will be tagged with this VLAN ID. More info: <a href="${this.wikiBase}/solaris#LDOM_Create">Wiki</a>`;

}
