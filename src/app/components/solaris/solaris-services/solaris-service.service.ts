import { Injectable } from '@angular/core';
import { SolarisCdom } from '../../../models/solaris-cdom';
import { SolarisLdom } from '../../../models/solaris-ldom';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/services/message.service';

@Injectable({
  providedIn: 'root'
})
export class SolarisServiceService {
  public ldomFilter: string[];
  private LDOM: SolarisLdom;
  private CDOM: SolarisCdom;

  constructor(
  //  private LDOM: SolarisLdom,
  //  private CDOM: SolarisCdom,
    private automationApiService: AutomationApiService,
    private router: Router,
    private messageService: MessageService

  ) {
     // this.LDOM = new SolarisLdom();
      // this.CDOM = new SolarisCdom();
   }
  getLDOMDevice(device: any){
   const LDOMDevice = new SolarisLdom();
   const tmpMetadata: any = this.sanitizeMetadata(device.Metadata);
   LDOMDevice.associatedcdom = tmpMetadata.associatedcdom;
   LDOMDevice.name = tmpMetadata.Name;
   // LDOMDevice.luns = tmpMetadata.luns;
   // LDOMDevice.vlans = tmpMetadata.vlans;
   LDOMDevice.set_variable = tmpMetadata.variables;
   // LDOMDevice.vswitch = tmpMetadata.vswitch;
   return LDOMDevice;
  }
  getCDOMDevice(device: any){
    const CDOMDevice = new SolarisCdom();
    const tmpMetadata: any = this.sanitizeMetadata(device.Metadata);
    CDOMDevice.associatedldoms = tmpMetadata.associatedldoms;
    CDOMDevice.name = tmpMetadata.cdomname;
    CDOMDevice.luns = tmpMetadata.luns;
    CDOMDevice.vlans = tmpMetadata.vlans;
    CDOMDevice.variables = tmpMetadata.variables;
    CDOMDevice.ilomname = tmpMetadata.ilomname;
    CDOMDevice.ilomipaddress = tmpMetadata.ilomip;
    CDOMDevice.vcc = tmpMetadata.vccports;
    CDOMDevice.vswitch = tmpMetadata.vswitch;
    //Determine number of vCPU's, non hyperthread Core * Count, hyperthreaded (Core * Count) * 2
    let numVCPU: number = device.cpucount * device.cpucore;
    if(device.Hyperthreading === 'Yes'){
      numVCPU = numVCPU * 2;
      CDOMDevice.vcpu = numVCPU;
    } else{
      CDOMDevice.vcpu = numVCPU;
    }
    //normalize RAM to GB.  TODO, allow dynamic update
    let RAMRawData  = device.ram;
    if(device.ram_size_type == 'MB'){
       RAMRawData = Math.round(RAMRawData / 1024);
    } else if (device.ram_size_type === 'TB'){
        //multiply by 1024 to get GB
        RAMRawData = Math.round(RAMRawData * 1024);
    } else if (device.ram_size_type === 'GB' ){
      //standard, don't do anything
    }
    CDOMDevice.ram = RAMRawData;
    return CDOMDevice;
  }
  sanitizeMetadata(metadata: string){
    metadata = metadata.replace(/\\n/g, ' ');
    return JSON.parse(metadata);
  }
    // Launch required automation jobs
    private launchCDOMJobs() {
      const body = {
        extra_vars: `{\"vlans\": ${this.CDOM.vlans},\"luns\": ${this.CDOM.luns }
        ,\"associatedldoms\": ${this.CDOM.associatedldoms},\"variables\": ${this.CDOM.variables}
        ,\"vcsdevs\": ${this.CDOM.vcsdevs}}, \"vnet\": ${this.CDOM.vnet}, \"vswitch\": ${this.CDOM.vswitch}`
      };
      this.automationApiService.launchTemplate('save_device', body).subscribe();
      this.messageService.filter('Job Launched');
      this.router.navigate(['/solaris']);
    }
      // Launch required automation jobs
  private launchLDOMJobs() {
    const body = {
      extra_vars: `\"associatedcdom\": ${this.LDOM.associatedcdom},\"variables\": ${this.LDOM.set_variable}`
    };

    this.automationApiService.launchTemplate('save_device', body).subscribe();
    this.messageService.filter('Job Launched');
    this.router.navigate(['/solaris']);
  }
}
