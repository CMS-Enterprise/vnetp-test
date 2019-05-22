import { Component, OnInit } from '@angular/core';
import { SolarisCdom } from '../../../models/solaris-cdom';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { SolarisServiceService } from '../solaris-services/solaris-service.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService } from 'src/app/services/message.service';
@Component({
  selector: 'app-solaris-cdom-create',
  templateUrl: './solaris-cdom-create.component.html',
  styleUrls: ['./solaris-cdom-create.component.css']
})
export class SolarisCdomCreateComponent implements OnInit {
  CDOM: SolarisCdom;
  LDOMDeviceArray: Array<any>;
  CDOMDeviceArray: Array<any>;
  returnDevices: Array<any>;
  clonefromCDOM: SolarisCdom;
  constructor(
    private automationApiService: AutomationApiService,
    private solarisService: SolarisServiceService,
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService
    ){
    this.CDOM = new SolarisCdom();
  }
  setCurrentCDOM(cdomInput: SolarisCdom){
    this.CDOM = cdomInput;
  }
  ngOnInit() {
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
        this.CDOMDeviceArray.push(new SolarisCdom());
       }
       // this.vnets = this.CDOMDeviceArray
      });
      //  this.CDOMDeviceArray = this.returnDevices[0].value;
    });
  }

  moveObjectPosition(value: number, obj, objArray){
   this.solarisService.moveObjectPosition(value, obj, objArray);
  }
  launchCDOMJobs() {

    let extra_vars: {[k: string]: any} = {};
    this.CDOM.customer_name = this.authService.currentUserValue.CustomerName;
    this.CDOM.devicetype = "solaris_cdom";
    extra_vars.CDOM = this.CDOM;

    const body = { extra_vars };

    //this.automationApiService
    //const customerName = this.solarisService.getCustomerNamebyDeviceID(this.LDOM.device_id);
    this.automationApiService.launchTemplate(`${this.CDOM.customer_name}-save-device`, body).subscribe();
    this.messageService.filter('Job Launched');
    this.router.navigate(['/solaris']);
  }
}
