import { Component, OnInit } from '@angular/core';
import { SolarisService } from '../solaris-services/solaris-service.service';
import { SolarisLdom } from 'src/app/models/solaris/solaris-ldom';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/services/message.service';
import { SolarisCdom} from 'src/app/models/solaris/solaris-cdom';
import { AuthService } from 'src/app/services/auth.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { SolarisCdomResponse } from 'src/app/models/interfaces/solaris-cdom-response.interface';
import { SolarisVariable } from 'src/app/models/solaris/solaris-variable';
import { HelpersService } from 'src/app/services/helpers.service';
import { SolarisVswitch } from 'src/app/models/solaris/solaris-vswitch';
import { SolarisVnet } from 'src/app/models/solaris/solaris-vnet';
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

  vnetModalVswitches: Array<SolarisVswitch>;

  newSolarisVariable: SolarisVariable;
  addVdsDev: any;
  addVnet: SolarisVnet;

  // Added as type any
  cpuCountArray: number[];
  ramCountArray: number[];

  constructor(
    private solarisService: SolarisService,
    private automationApiService: AutomationApiService,
    private router: Router,
    private messageService: MessageService,
    private authService: AuthService,
    private hs: HelpersService,
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

    this.cpuCountArray = this.solarisService.buildNumberArray(2, 32, 2);
    this.ramCountArray = this.solarisService.buildNumberArray(2, 64, 2);

    this.LDOM.vds = new Array<any>();
    this.addVdsDev = {vds: '', diskName: '', diskSize: 0};
    this.addVnet = new SolarisVnet();
  }

  openVdsModal() {
    this.ngxSm.getModal('vdsDevModalLdom').open();
  }

  insertVds() {
    this.LDOM.vds.push(Object.assign({}, this.addVdsDev));
    this.addVdsDev = {vds: '', diskName: '', diskSize: 0};
    this.ngxSm.getModal('vdsDevModalLdom').close();
  }
  openVnetModal() {
      // Since Devices returned from Device42 don't include custom fields, get the id
      // of the device representing the CDOM and then get it from the API and hydrate
      // the selected CDOM with its custom fields.
    this.automationApiService.getDevicesbyID(this.LDOM.associatedcdom.device_id).subscribe(data => {
      const result = data as SolarisCdom;
      const cdomFull = this.hs.getJsonCustomField(result, 'Metadata') as SolarisCdom;
      this.LDOM.associatedcdom = cdomFull;
      this.ngxSm.getModal('vnetModalLdom').open();
    });
  }
  insertVnet() {
    this.LDOM.vnet.push(this.hs.deepCopy(this.addVnet));
    this.addVnet = new SolarisVnet();
    this.ngxSm.getModal('vnetModalLdom').close();
  }

  deleteVdsDev(vdsDev: any) {
    const vdsIndex = this.LDOM.vds.indexOf(vdsDev);
    if (vdsIndex > -1 ) {
      this.LDOM.vds.splice(vdsIndex, 1);
    }
  }
  deletevNet(vnetDev: any) {
    const vnetIndex = this.LDOM.vnet.indexOf(vnetDev);
    if (vnetIndex > -1 ) {
      this.LDOM.vnet.splice(vnetIndex, 1);
    }
  }
}
