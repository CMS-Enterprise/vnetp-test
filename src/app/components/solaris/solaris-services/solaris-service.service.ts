import { Injectable } from '@angular/core';
import { SolarisCdom } from '../../../models/solaris-cdom';
import { SolarisLdom } from '../../../models/solaris-ldom';
import { AutomationApiService } from 'src/app/services/automation-api.service';
// import { Router } from '@angular/router';
// import { MessageService } from 'src/app/services/message.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user';

@Injectable({
  providedIn: 'root'
})
export class SolarisServiceService {
  public ldomFilter: string[];
  private LDOM: SolarisLdom;
  private CDOM: SolarisCdom;
  CDOMDevice = new SolarisCdom();
  LDOMDevice = new SolarisLdom();
  CDOMArray: Array<any>;
  LDOMArray: Array<any>;
  currentUser: User;
  AllDevices: Array<any>;
  AllSolaris: Array<any>;
  constructor(
    private automationApiService: AutomationApiService,
    // private router: Router,
    // private messageService: MessageService,
    private auth: AuthService
  ) {
     // this.LDOM = new SolarisLdom();
      // this.CDOM = new SolarisCdom();
      this.CDOMArray = new Array<any>();
      this.LDOMArray = new Array<any>();
      this.auth.currentUser.subscribe(u => this.currentUser = u);
      this.AllSolaris = new Array<any>();

   }
  getLDOMDevice(device: any){
   const LDOMDevice = new SolarisLdom();
   const tmpMetadata: any = this.sanitizeMetadata(device.Metadata);
   LDOMDevice.associatedcdom = tmpMetadata.associatedcdom;
   LDOMDevice.name = tmpMetadata.Name;
   // LDOMDevice.luns = tmpMetadata.luns;
   // LDOMDevice.vlans = tmpMetadata.vlans;
   LDOMDevice.customer_name = this.currentUser.CustomerName;
   LDOMDevice.associatedcdom = tmpMetadata.associatedcdom;
   LDOMDevice.set_variable = tmpMetadata.variables;
   // LDOMDevice.vswitch = tmpMetadata.vswitch;
   LDOMDevice.device_id = device.device_pk;
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
    CDOMDevice.add_vcc = tmpMetadata.vccports;
    CDOMDevice.vswitch = tmpMetadata.vswitch;
    CDOMDevice.add_vds = tmpMetadata.add_vds;
    CDOMDevice.set_vcpu = device.cpucore; 
    CDOMDevice.set_mem = `${device.ram}${device.ram_size_type}`
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
    CDOMDevice.set_mem = device.ram;
    return CDOMDevice;
  }
  loadDevices(result : any) {
    //load already configured devices and settings from Device42
    // return new Promise(resolve => {
    // this.automationApiService
    //   .doqlQuery(
    //     "SELECT * FROM view_device_custom_fields_flat_v1 cust LEFT JOIN view_device_v1 std ON std.device_pk = cust.device_fk"
    //   )
    //   .subscribe(data => {
    //     let result = data as any;
        this.AllDevices = result;
        for (let i = this.AllDevices.length - 1; i >= 0; --i) {
          if (this.AllDevices[i].DeviceType == "solaris_cdom") {
            const currentDevice = this.getCDOMDevice(
              this.AllDevices[i]
            );
            console.log(currentDevice);
            this.CDOMArray.push(currentDevice);
          } else if (this.AllDevices[i].DeviceType == "solaris_ldom") {
            const currentDevice = this.getLDOMDevice(
              this.AllDevices[i]
            );
            console.log(currentDevice);
            this.LDOMArray.push(currentDevice);
          }
          console.log(this.LDOMArray);
        }
        //finished looping through all devices, create dictionary to store CDOM/LDOM objects
        this.AllSolaris.push({
          key: "CDOM",
          value: this.CDOMArray
        });
        this.AllSolaris.push({
          key: "LDOM",
          value: this.LDOMArray
        });
        console.log('Service',this.AllSolaris);
        return this.AllSolaris;
    //   });
    // });
  }
  sanitizeMetadata(metadata: string){
    metadata = metadata.replace(/\\n/g, ' ');
    return JSON.parse(metadata);
  }
    // Launch required automation jobs
    private launchCDOMJobs() {
      const body = {
        extra_vars: `{\"vlans\": ${this.CDOM},\"luns\": ${this.CDOM.luns }
        ,\"associatedldoms\": ${this.CDOM.associatedldoms},\"variables\": ${this.CDOM.variables}
        ,\"vcsdevs\": ${this.CDOM.vcsdevs}}, \"vnet\": ${this.CDOM.vnet}, \"vswitch\": ${this.CDOM.vswitch}`
      };
      this.automationApiService.launchTemplate('save_device', body).subscribe();
      // this.messageService.filter('Job Launched');
      // this.router.navigate(['/solaris']);
    }
      // Launch required automation jobs

  moveObjectPosition(value: number, obj, objArray){
        //determine the current index in the array
        const objIndex = objArray.indexOf(obj);
        // If the object isn't in the array, is at the start of the array and requested to move up
        // or if the object is at the end of the array, return.
        if (objIndex === -1 || objIndex === 0 && value === -1 || objIndex + value === objArray.length) { return; }
        const nextObj = objArray[objIndex + value];
        //If next object doesn't exist, return
        if (nextObj == null ) { return ;}
        const nextObjIndex = objArray.indexOf(nextObj);
        [objArray[objIndex], objArray[nextObjIndex]] =
        [objArray[nextObjIndex], objArray[objIndex]]
   }
   deleteObject(obj, objArray){
     const objIndex = objArray.indexOf(obj);
     if(objIndex > -1){
       objArray.splice(objIndex, 1);
     }
   }


  returnUnique(array : Array<any>){
    const uniqueArray = new Array<any>();

    array.forEach( (obj) => {
      if (uniqueArray.indexOf(obj) < 0) {
        uniqueArray.push(obj);
      }
    });

    return uniqueArray;
  }
}
