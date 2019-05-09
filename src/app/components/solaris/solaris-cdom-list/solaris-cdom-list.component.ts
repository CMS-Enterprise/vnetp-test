import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { SolarisCdom } from '../../../models/solaris-cdom';
import { SolarisLdom } from '../../../models/solaris-ldom';
import { listenToElementOutputs } from '@angular/core/src/view/element';
@Component({
  selector: 'app-solaris-cdom-list',
  templateUrl: './solaris-cdom-list.component.html',
  styleUrls: ['./solaris-cdom-list.component.css']
})
export class SolarisCdomListComponent implements OnInit {
  devices: Array<any>;
  returnDevices: Array<SolarisCdom>;
  returnLDOMs: Array<SolarisLdom>;
  CDOMDeviceArray: Array<any>;
  constructor(private automationApiService: AutomationApiService) {
    this.devices = new Array<any>();
    this.returnDevices = new Array<SolarisCdom>();
  }
  ngOnInit() {
    this.loadDevices();
  }

  loadDevices() {
     const CDOMDevice = new SolarisCdom();
     const LDOMDevice = new SolarisLdom();
     let CDOMDict: string[];
     //const CDOMDevice = new Array<any>;
     this.automationApiService.doqlQuery(
        'SELECT * FROM view_device_custom_fields_flat_v1 cust LEFT JOIN view_device_v1 std ON std.device_pk = cust.device_fk'
      ).subscribe(data => {
        let result = data as any;
        this.devices = result;
        for(let i = this.devices.length - 1; i >= 0 ; --i){
          if(this.devices[i].DeviceType == 'solaris_cdom'){
            let jsonStr: string = this.devices[i].Metadata;
            jsonStr = jsonStr.replace(/\\n/g, ' ');
            let tmpMetadata: any = JSON.parse(jsonStr);
            console.log(tmpMetadata['DeviceType']);
            CDOMDevice.AssociatedLDOMS = tmpMetadata['associatedldoms'];
            CDOMDevice.Name = tmpMetadata['cdomname'];
            CDOMDevice.LUNs = tmpMetadata['luns'];
            CDOMDevice.VLANs = tmpMetadata['vlans'];
            CDOMDevice.Variables = tmpMetadata['variables'];
            CDOMDevice.ILOMName = tmpMetadata['ilomname'];
            CDOMDevice.ILOMIPAddress = tmpMetadata['ilomip'];
            CDOMDevice.VCC = tmpMetadata['vccports'];
            CDOMDevice.Vswitch = tmpMetadata['vswitch'];
            //Determine number of vCPU's, non hyperthread Core * Count, hyperthreaded (Core * Count) * 2
            let numVCPU: number = this.devices[i].cpucount * this.devices[i].cpucore;
            if(this.devices[i].Hyperthreading == 'Yes'){
              numVCPU = numVCPU * 2;
              CDOMDevice.CPU = numVCPU;
            } else{
              CDOMDevice.CPU = numVCPU;
            }
            //normalize RAM to GB
            let RAMRawData  = this.devices[i].ram;
            if(this.devices[i].ram_size_type != 'GB'){
               RAMRawData = Math.round(RAMRawData / 1024);
            }
            CDOMDevice.Memory = RAMRawData;
            this.returnDevices.push(CDOMDevice);
          }
          else if(this.devices[i].DeviceType == 'solaris_ldom'){
            let jsonStr: string = this.devices[i].Metadata;
            jsonStr = jsonStr.replace(/\\n/g, ' ');
            let tmpMetadata: any = JSON.parse(jsonStr);
            //Loop through all ldom devices, create dictionary with key of CDOM
            let tmpThisCDOM: string = tmpMetadata.AssociatedCDOM;
            console.log(tmpThisCDOM);
            LDOMDevice.AssociatedCDOM = tmpMetadata['AssociatedCDOM'];
            LDOMDevice.Name = tmpMetadata['Name'];
            LDOMDevice.LUNs = tmpMetadata['luns'];
            LDOMDevice.VLANs = tmpMetadata['vlans'];
            LDOMDevice.Variables = tmpMetadata['variables'];
            LDOMDevice.Vswitch = tmpMetadata['vswitch'];
            CDOMDict[LDOMDevice.Name]=(LDOMDevice);
            console.log(CDOMDict[LDOMDevice.Name]);
          }
        }
        console.log(this.devices[0]);
        this.devices = this.returnDevices;
      });
  }
}
