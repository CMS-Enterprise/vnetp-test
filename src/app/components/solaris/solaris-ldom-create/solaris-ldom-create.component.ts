import { Component, OnInit } from '@angular/core';
import { SolarisService } from '../solaris-services/solaris-service.service';
import { SolarisLdom, SolarisVariable } from 'src/app/models/solaris-ldom';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/services/message.service';
import { SolarisCdom, SolarisCdomResponse } from 'src/app/models/solaris-cdom';
import { AuthService } from 'src/app/services/auth.service';
import { NgxSmartModalService } from 'ngx-smart-modal';

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

  newSolarisVariable: SolarisVariable;
  addVdsDev: any;

  // Added as type any
  cpuCountArray: number[];
  ramCountArray: number[];

  constructor(
    private solarisService: SolarisService,
    private automationApiService: AutomationApiService,
    private router: Router,
    private messageService: MessageService,
    private authService: AuthService,
    private ngxSm: NgxSmartModalService
    ) {
    this.vnets = new Array<any>();
    this.LDOM = new SolarisLdom();

  }
  addVariable() {
    if (!this.newSolarisVariable) { return; }
    if (!this.LDOM.variables) { this.LDOM.variables = new Array<SolarisVariable>(); }
    this.LDOM.variables.push(Object.assign({}, this.newSolarisVariable));
    this.newSolarisVariable = new SolarisVariable();
  }
  deleteVariable(solarisVariable: SolarisVariable) {
    const index = this.LDOM.variables.indexOf(solarisVariable);
    if ( index > -1) {
      this.LDOM.variables.splice(index, 1);
    }
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
    // FIXME: [jvf] if it's hard coded in the UI, it's better for it to be hardcoded
    // in userland rather than running it across the wire and through the DB.
    // static listing of commands to be ran, needed for Solaris automation
    extra_vars.LDOM = this.LDOM;

    const body = { extra_vars };

    this.automationApiService.launchTemplate(`save-ldom`, body).subscribe();
    this.messageService.filter('Job Launched');
    this.router.navigate(['/solaris']);
  }
  ngOnInit() {
    this.newSolarisVariable = new SolarisVariable();
    this.automationApiService.getCDoms()
      .subscribe(data => {
        const cdomResponse = data as SolarisCdomResponse;
        this.CDOMDeviceArray = cdomResponse.Devices;
    });

    this.cpuCountArray = this.solarisService.buildNumberArray(2, 128, 2);
    this.ramCountArray = this.solarisService.buildNumberArray(0, 512, 32);
    this.LDOM.vds = new Array<any>();
    this.addVdsDev = {vds: '', diskName: '', diskSize: 0};
  }

  openVdsModal() {
    this.ngxSm.getModal('vdsDevModalLdom').open();
  }

  insertVds() {
    this.LDOM.vds.push(Object.assign({}, this.addVdsDev));
    this.addVdsDev = {vds: '', diskName: '', diskSize: 0};
    this.ngxSm.getModal('vdsDevModalLdom').close();
  }

  deleteVdsDev(vdsDev: any) {
    const vdsIndex = this.LDOM.vds.indexOf(vdsDev);
    if (vdsIndex > -1 ) {
      this.LDOM.vds.splice(vdsIndex, 1);
    }
  }
}
