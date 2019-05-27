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
  LDOM: SolarisLdom;
  ldomFilter: string[];
  vnets: Array<any>;
  vdisks: string[];
  inputLDOMvnet: string;
  inputLDOMvds: string;
  inputLDOMvdswwn: string;
  inputLDOMvdiskname: string;
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
  printCDOM(cdomInput: SolarisCdom) {
    this.currentCDOM = cdomInput;
  }
  addvnetObject(obj: any, objArray: Array<any>) {
     objArray.push(obj);
     this.inputLDOMvnet = '';
  }
  addvdsObject(objVDSwwn: string, objvDiskname: string, objVDS: string, objArray: Array<any>) {
    objArray.push(`${objVDSwwn},${objvDiskname},${objVDS}`);
    this.inputLDOMvds = '';
    this.inputLDOMvdswwn = '';
    this.inputLDOMvdiskname = '';
 }
  getvnetCmds() {
   // Create commands that will be sent as add-vnet parameter
   for (let i = 0; i < this.LDOM.add_vnet.length; i++) {
    const vnetCmdString = `id=${i} vnet${i} ${this.LDOM.add_vnet[i]}`;
    this.LDOM.add_vnet_cmd.push(vnetCmdString);
    this.inputLDOMvnet = '';
   }
   console.log(this.LDOM.add_vnet_cmd);
  }
  getvdsCmds() {
    // Create commands that will be sent as add-vnet parameter
    for (let i = 0; i < this.LDOM.add_vds.length; i++) {
    //TODO:  Split array and ensure it is 3 elements
     const WWN = this.LDOM.add_vcpu[i].split(',')[0];
     const diskName = this.LDOM.add_vcpu[i].split(',')[1];
     const VDS = this.LDOM.add_vcpu[i].split(',')[2];
     const vdsCmdString = `/dev/disk/c0t${WWN}d0s2 ${diskName}@${VDS}`;
     const vdiskCmdString = `id=${i} ${diskName} ${diskName}@${VDS}`;
     this.LDOM.add_vds_cmd.push(vdsCmdString);
     this.LDOM.add_vdisk_cmd.push(vdiskCmdString);

     // add_vdisk: 'id=0 lde43s032pdisk1 lde43s032pdisk1@primary-vds0'
    }
    this.inputLDOMvdiskname = '';
    this.inputLDOMvdswwn = '';
    this.inputLDOMvds = '';
    console.log(this.LDOM.add_vds_cmd);
    console.log(this.LDOM.add_vdisk_cmd);
   }
  addvds(vdsWWN: string) {
   this.LDOM.add_vds.push(this.inputLDOMvds);
   // Create commands that will be sent as add-vnet parameter
   const vdsIndex = this.LDOM.add_vds.length - 1;
   const vdsCmdString = `/dev/dsk/${vdsWWN} ${this.LDOM.name}@${this.inputLDOMvds}`;
   this.LDOM.add_vds_cmd.push(vdsCmdString);
   this.inputLDOMvds = '';
  }
  moveObjectPosition(value: number, obj, objArray) {
   this.solarisService.moveObjectPosition(value, obj, objArray);
  }
  deleteObject(obj, objArray) {
    this.solarisService.deleteObject(obj, objArray);
  }
  launchLDOMJobs() {
  // tslint:disable-next-line: variable-name
    const extra_vars: {[k: string]: any} = {};
    this.LDOM.customer_name = this.authService.currentUserValue.CustomerName;
    this.LDOM.devicetype = 'solaris_ldom';
    //static listing of commands to be ran, needed for Solaris automation
    this.LDOM.cmds = 'add_domain,add_memory,add_vcpu,add_vnet,add_vdsdev,add_vdisk,set_variable,bind_domain,create_manifest,add_config,start_domain,net_install';
    extra_vars.LDOM = this.LDOM;

    const body = { extra_vars };

    // this.automationApiService
    // const customerName = this.solarisService.getCustomerNamebyDeviceID(this.LDOM.device_id);
    const customerName = 'contoso';
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
    'SELECT * FROM view_device_custom_fields_flat_v1 cust LEFT JOIN view_device_v1 std ON std.device_pk = cust.device_fk'
  )
  .subscribe(data => {

    this.returnDevices = this.solarisService.loadDevices(data);
    this.returnDevices.forEach((obj) => {
     if (obj.key === 'LDOM') {
       this.LDOMDeviceArray = obj.value;
     } else if (obj.key === 'CDOM') {
      this.CDOMDeviceArray = obj.value;
     }
     // this.vnets = this.CDOMDeviceArray
    });
    //  this.CDOMDeviceArray = this.returnDevices[0].value;
  });
  }
}
