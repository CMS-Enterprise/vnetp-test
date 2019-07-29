import { Injectable } from '@angular/core';
import { SolarisCdom } from '../../../models/solaris/solaris-cdom';
import { SolarisLdom } from '../../../models/solaris/solaris-ldom';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user/user';
import { SolarisVswitch } from 'src/app/models/solaris/solaris-vswitch';
import { SolarisVnic } from 'src/app/models/solaris/solaris-vnic';
import { SolarisVdsDevs } from 'src/app/models/solaris/solaris-vds-devs';

@Injectable({
  providedIn: 'root'
})
export class SolarisService {
  public ldomFilter: string[];
  CDOMDevice = new SolarisCdom();
  LDOMDevice = new SolarisLdom();
  CDOMArray: Array<any>;
  LDOMArray: Array<any>;
  currentUser: User;
  AllDevices: Array<any>;
  AllSolaris: Array<any>;
  parentCdom = new SolarisCdom();
  currentCdom = new SolarisCdom();
  currentLdom = new SolarisLdom();
  currentVswitch = new SolarisVswitch();
  currentVnic = new SolarisVnic();
  currentVds = new SolarisVdsDevs();
  SolarisImageDeviceName: string;
  
  constructor(
    private auth: AuthService
  ) {

      this.CDOMArray = new Array<any>();
      this.LDOMArray = new Array<any>();
      this.auth.currentUser.subscribe(u => this.currentUser = u);
      this.AllSolaris = new Array<any>();
      this.SolarisImageDeviceName = `__${this.auth.currentUserValue.CustomerName}_solaris_images__`.toLowerCase();

   }
  getLDOMDevice(device: any) {
   const LDOMDevice = new SolarisLdom();
   const tmpMetadata: any = this.sanitizeMetadata(device.Metadata);
   LDOMDevice.associatedcdom = tmpMetadata.associatedcdom;
   LDOMDevice.name = tmpMetadata.Name;
   LDOMDevice.customer_name = this.currentUser.CustomerName;
   LDOMDevice.associatedcdom = tmpMetadata.associatedcdom;
   LDOMDevice.variables = tmpMetadata.variables;
   LDOMDevice.device_id = device.device_pk;
   return LDOMDevice;
  }
  getCDOMDevice(device: any) {
    const CDOMDevice = new SolarisCdom();
    const tmpMetadata: any = this.sanitizeMetadata(device.Metadata);
    CDOMDevice.associatedldoms = tmpMetadata.associatedldoms;
    CDOMDevice.name = tmpMetadata.cdomname;
    CDOMDevice.vlans = tmpMetadata.vlans;
    CDOMDevice.variables = tmpMetadata.variables;
    CDOMDevice.vcc = tmpMetadata.vccports;
    CDOMDevice.vds = tmpMetadata.add_vds;
    CDOMDevice.vcpu = device.cpucore;
    CDOMDevice.memory = device.ram;
    return CDOMDevice;
  }
  loadDevices(result: any) {
    // load already configured devices and settings from Device42
        // clear previously loaded devices
        this.AllSolaris = new Array<any>();
        this.CDOMArray = new Array<any>();
        this.LDOMArray = new Array<any>();
        this.AllDevices = result;
        for (let i = this.AllDevices.length - 1; i >= 0; --i) {
          if (this.AllDevices[i].DeviceType === 'solaris_cdom') {
            const currentDevice = this.getCDOMDevice(
              this.AllDevices[i]
            );
            console.log(currentDevice);
            this.CDOMArray.push(currentDevice);
          } else if (this.AllDevices[i].DeviceType === 'solaris_ldom') {
            const currentDevice = this.getLDOMDevice(
              this.AllDevices[i]
            );
            console.log(currentDevice);
            this.LDOMArray.push(currentDevice);
          }
          console.log(this.LDOMArray);
        }
        // finished looping through all devices, create dictionary to store CDOM/LDOM objects
        this.AllSolaris.push({
          key: 'CDOM',
          value: this.CDOMArray
        });
        this.AllSolaris.push({
          key: 'LDOM',
          value: this.LDOMArray
        });
        console.log('Service', this.AllSolaris);
        return this.AllSolaris;
  }
  sanitizeMetadata(metadata: string) {
    metadata = metadata.replace(/\\n/g, ' ');
    return JSON.parse(metadata);
  }

  moveObjectPosition(value: number, obj, objArray) {
        // determine the current index in the array
        const objIndex = objArray.indexOf(obj);
        // If the object isn't in the array, is at the start of the array and requested to move up
        // or if the object is at the end of the array, return.
        if (objIndex === -1 || objIndex === 0 && value === -1 || objIndex + value === objArray.length) { return; }
        const nextObj = objArray[objIndex + value];
        // If next object doesn't exist, return
        if (nextObj == null ) { return ; }
        const nextObjIndex = objArray.indexOf(nextObj);
        [objArray[objIndex], objArray[nextObjIndex]] =
        [objArray[nextObjIndex], objArray[objIndex]];
   }
   deleteObject(obj, objArray) {
     const objIndex = objArray.indexOf(obj);
     if (objIndex > -1) {
       objArray.splice(objIndex, 1);
     }
   }

  returnUnique(array: Array<any>) {
    const uniqueArray = new Array<any>();

    array.forEach( (obj) => {
      if (uniqueArray.indexOf(obj) < 0) {
        uniqueArray.push(obj);
      }
    });

    return uniqueArray;
  }

  buildNumberArray(start, end, step): Array<number> {
    const array = new Array<number>();
    let current = start;
    while (current <= end) {
      if (current > 0) {
        array.push(current);
      }
      current += step;
    }
    return array;
  }
}
