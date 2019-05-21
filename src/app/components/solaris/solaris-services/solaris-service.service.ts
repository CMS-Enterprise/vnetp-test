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
   console.log(this.getCustomerNamebyDeviceID(device.device_pk));
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

  getCustomerNamebyDeviceID (id: string){
    this.automationApiService.getDevicesbyID(id).subscribe(
      singleDevData => {
        const singleDevResult = singleDevData as any;

        console.log(singleDevResult.customer);
        return singleDevResult.customer;
      });
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
