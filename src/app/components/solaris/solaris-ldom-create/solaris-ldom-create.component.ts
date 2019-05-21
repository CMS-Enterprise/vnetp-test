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
    console.log(this.currentCDOM);
  }
  addvnets(){
    /*
    var vnetUL = document.getElementById("vnetUL");

    var li = document.createElement("li");
    li.setAttribute('id', vnetInput.nodeValue);
    li.appendChild(document.createTextNode(vnetName));
    vnetUL.appendChild(li);
    */
   // var vnetInputtest = (<HTMLInputElement>document.getElementById("inputLDOMvnet")).value;
   this.LDOM.add_vnet.push(this.inputLDOMvnet);
   //Create commands that will be sent as add-vnet parameter 
   const vnetIndex = this.LDOM.add_vnet.length - 1
   const vnetCmdString = `id=${vnetIndex} vnet${vnetIndex} ${this.inputLDOMvnet}`
   this.LDOM.add_vnet_cmd.push(vnetCmdString);
   this.inputLDOMvnet = '';
   console.log(this.vnets);
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
    // const body = {
    //   extra_vars: `\"associatedcdom\": \"${this.LDOM.associatedcdom}\",\"set_variable\": \"${this.LDOM.set_variable}\"
    //               ,\"add_domain\": \"${this.LDOM.add_domain}\", \"add_vcpu\": \"${this.LDOM.add_vcpu}\"
    //               ,\"add_memory\": \"${this.LDOM.add_memory}\", \"add_vdsdev\": \"${this.LDOM.add_vdsdev}\",
    //               ,\"add_vnet_cmd"\: \"${this.LDOM.add_vnet_cmd}\", \"add_vdisk_cmd\": \"${this.LDOM.add_vdisk_cmd}\",
    //               ,\"add_vnet"\: \"${this.LDOM.add_vnet}\", \"add_vdisk\": \"${this.LDOM.add_vdisk}\"
    //               ,\"bip"\: \"${this.LDOM.bip}\", \"bmask\": \"${this.LDOM.bmask}\", \"bgw\": \"${this.LDOM.bgw}\"`
    // };

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
  getLdoms() {

    if (this.ldomFilter) {
    // this.apiService.getLdoms(this.ldomFilter);
    } else if (!this.ldomFilter) {
      // this.apiService.getLdoms();
    }
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
    console.log('Component',this.returnDevices);
    this.returnDevices.forEach((obj) => {
     if(obj.key === "LDOM"){
       this.LDOMDeviceArray = obj.value;
     }
     else if(obj.key === "CDOM"){
      this.CDOMDeviceArray = obj.value;
     }
     // this.vnets = this.CDOMDeviceArray
     console.log(this.CDOMDeviceArray);
    });
    //  this.CDOMDeviceArray = this.returnDevices[0].value;
    console.log(this.CDOMDeviceArray);
  });
  //Get Unique vswitches
  
  }
}
