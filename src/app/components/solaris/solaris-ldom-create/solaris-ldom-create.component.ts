import { Component, OnInit } from '@angular/core';
import { SolarisServiceService } from '../solaris-services/solaris-service.service';
import { SolarisLdom } from 'src/app/models/solaris-ldom';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/services/message.service';
import { extractStyleParams } from '@angular/animations/browser/src/util';
import { SolarisCdom } from 'src/app/models/solaris-cdom';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-solaris-ldom-create',
  templateUrl: './solaris-ldom-create.component.html',
   styleUrls: ['./solaris-ldom-create.component.css']
})
export class SolarisLdomCreateComponent implements OnInit {
  LDOM: SolarisLdom
  ldomFilter: string[];
  vnets: Array<any>;
  vdisks: string[];
  inputLDOMvnet: string;
  inputLDOMvds: string;
  returnDevices: Array<any>;
  LDOMDeviceArray: Array<any>;
  CDOMDeviceArray: Array<any>;
  currentCDOM: SolarisCdom;
  constructor(
    private solarisService: SolarisServiceService,
    private automationApiService: AutomationApiService,
    private router: Router,
    private messageService: MessageService,
    private authService: AuthService
    ) { 
    this.vnets = new Array<any>();
    this.LDOM = new SolarisLdom();

  }
  printCDOM(cdomInput: SolarisCdom){
    this.currentCDOM = cdomInput;
  }
  addvnets(){
   this.LDOM.add_vnet.push(this.inputLDOMvnet);
   //Create commands that will be sent as add-vnet parameter 
   const vnetIndex = this.LDOM.add_vnet.length - 1
   const vnetCmdString = `id=${vnetIndex} vnet${vnetIndex} ${this.inputLDOMvnet}`
   this.LDOM.add_vnet_cmd.push(vnetCmdString);
   this.inputLDOMvnet = '';
  }
  addvds(vdsWWN: string){
   this.LDOM.add_vds.push(this.inputLDOMvds);
   //Create commands that will be sent as add-vnet parameter 
   const vdsIndex = this.LDOM.add_vds.length - 1
   const vdsCmdString = `/dev/dsk/${vdsWWN} ${this.LDOM.name}@${this.inputLDOMvds}`
   this.LDOM.add_vds_cmd.push(vdsCmdString);
   this.inputLDOMvds = '';
  }
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
  launchLDOMJobs() {
    let extra_vars: {[k: string]: any} = {};
    this.LDOM.customer_name = this.authService.currentUserValue.CustomerName;
    this.LDOM.devicetype = "solaris_ldom";
    extra_vars.LDOM = this.LDOM;

    const body = { extra_vars };

    //this.automationApiService
    //const customerName = this.solarisService.getCustomerNamebyDeviceID(this.LDOM.device_id);
    const customerName = "contoso";
    this.automationApiService.launchTemplate(`${customerName}-save-device`, body).subscribe();
    this.messageService.filter('Job Launched');
    this.router.navigate(['/solaris']);
  }
  ngOnInit() {
    /*
    this.ldomFilter = Object.assign([], this.solarisService.ldomFilter as string[]);
    this.getLdoms();
    */
   this.automationApiService.doqlQuery(
    "SELECT * FROM view_device_custom_fields_flat_v1 cust LEFT JOIN view_device_v1 std ON std.device_pk = cust.device_fk"
  )
  .subscribe(data => {
    this.returnDevices = this.solarisService.loadDevices(data);
    this.returnDevices.forEach((obj) => {
     if(obj.key === "LDOM"){
       this.LDOMDeviceArray = obj.value;
     }
     else if(obj.key === "CDOM"){
      this.CDOMDeviceArray = obj.value;
     }
     // this.vnets = this.CDOMDeviceArray
    });
    //  this.CDOMDeviceArray = this.returnDevices[0].value;
  });
  }
}
