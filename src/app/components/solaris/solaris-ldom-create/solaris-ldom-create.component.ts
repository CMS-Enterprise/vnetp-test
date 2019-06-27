import { Component, OnInit, HostListener } from '@angular/core';
import { SolarisService } from '../solaris-services/solaris-service.service';
import { SolarisLdom } from 'src/app/models/solaris/solaris-ldom';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { Router } from '@angular/router';
import { SolarisCdom} from 'src/app/models/solaris/solaris-cdom';
import { AuthService } from 'src/app/services/auth.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { SolarisCdomResponse } from 'src/app/models/interfaces/solaris-cdom-response.interface';
import { SolarisVariable } from 'src/app/models/solaris/solaris-variable';
import { HelpersService } from 'src/app/services/helpers.service';
import { SolarisVswitch } from 'src/app/models/solaris/solaris-vswitch';
import { SolarisVnic } from 'src/app/models/solaris/solaris-vnic';
import { SolarisVdsDevs } from 'src/app/models/solaris/solaris-vds-devs';
import { PendingChangesGuard } from 'src/app/guards/pending-changes.guard';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-solaris-ldom-create',
  templateUrl: './solaris-ldom-create.component.html',
   styleUrls: ['./solaris-ldom-create.component.css']
})
export class SolarisLdomCreateComponent implements OnInit, PendingChangesGuard {
  LDOM: SolarisLdom;
  ldomFilter: string[];
  vnics: Array<any>;
  vdisks: string[];
  inputLDOMvnic: string;
  inputLDOMvds: string;
  inputLDOMvdswwn: string;
  inputLDOMvdiskname: string;
  returnDevices: Array<any>;
  LDOMDeviceArray: Array<any>;
  CDOMDeviceArray: Array<any>;
  currentCDOM: SolarisCdom;
  newSolarisVariable: SolarisVariable;
  addVdsDev: SolarisVdsDevs;
  modalVnic: SolarisVnic;
  testCDOM: SolarisCdom;
  // modalSelectedVswitch: SolarisVswitch;
  vnicModalVswitches: Array<SolarisVswitch>;
  vnicModalVswitch: SolarisVswitch;
  vnicModalTaggedVlans: Array<number>;
  addVnicInherit: boolean;
  cpuCountArray: number[];
  ramCountArray: number[];
  dirty: boolean;
  vnicModalUntaggedVlan: number;
  editLdom: boolean;

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return !this.dirty;
  }

  constructor(
    private solarisService: SolarisService,
    private automationApiService: AutomationApiService,
    private router: Router,
    private authService: AuthService,
    private hs: HelpersService,
    private ngxSm: NgxSmartModalService
    ) {
    this.vnics = new Array<any>();
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
  addvnicObject(obj: any, objArray: Array<any>) {
     objArray.push(obj);
     this.inputLDOMvnic = '';
  }
  moveObjectPosition(value: number, obj, objArray) {
   this.solarisService.moveObjectPosition(value, obj, objArray);
  }
  deleteObject(obj, objArray) {
    this.solarisService.deleteObject(obj, objArray);
  }
  launchLDOMJobs() {
  // tslint:disable-next-line: variable-name
    this.dirty = false;
    const extra_vars: {[k: string]: any} = {};
    this.LDOM.customer_name = this.authService.currentUserValue.CustomerName;
    this.LDOM.devicetype = 'solaris_ldom';
    // FIXME: [jvf] if it's hard coded in the UI, it's better for it to be hardcoded
    // in userland rather than running it across the wire and through the DB.
    // static listing of commands to be ran, needed for Solaris automation
    extra_vars.LDOM = this.LDOM;

    const body = { extra_vars };
    if ( this.editLdom != true) {
      this.automationApiService.launchTemplate(`save-ldom`, body, true).subscribe();
    } else {
      this.automationApiService.launchTemplate('save-ldom', body, true).subscribe();
    }
    this.router.navigate(['/solaris/ldom/list']);
  }
  ngOnInit() {
    // TODO: Tie to reactive form pristine.
    this.cpuCountArray = this.solarisService.buildNumberArray(2, 128, 2);
    this.ramCountArray = this.solarisService.buildNumberArray(2, 640, 2);
    this.dirty = true;
    this.newSolarisVariable = new SolarisVariable();
    this.LDOM.vds = new Array<any>();
    this.addVdsDev = new SolarisVdsDevs();
    this.modalVnic = new SolarisVnic();
    this.editLdom = false;
    this.automationApiService.getCDoms()
      .subscribe(data => {
        const cdomResponse = data as SolarisCdomResponse;
        this.CDOMDeviceArray = cdomResponse.Devices;
    });
    // first case is for new LDOM within a CDOM
    if ( this.solarisService.parentCdom.device_id != null && this.solarisService.currentLdom.name == null) {
      this.automationApiService.getDevicesbyID(this.solarisService.parentCdom.device_id).subscribe(data => {
          const result = data as SolarisCdom;
          this.LDOM.associatedcdom = this.CDOMDeviceArray.filter(c => c.device_id === result.device_id)[0];
      });
      this.solarisService.parentCdom = new SolarisCdom();
    }
    // this case is for edit LDOM
    if ( this.solarisService.currentLdom.name != null){
      this.editLdom = true;
      this.LDOM = this.solarisService.currentLdom;
      this.automationApiService.getDevicesbyID(this.solarisService.currentLdom.associatedcdom.device_id).subscribe(data => {
        const result = data as SolarisCdom;
        this.LDOM.associatedcdom = this.CDOMDeviceArray.filter(c => c.device_id === result.device_id)[0];
        this.solarisService.currentLdom = new SolarisLdom();
    });
    }
  }

  openVdsModal() {
    if ( this.solarisService.currentVds != null){
      this.addVdsDev = this.solarisService.currentVds;
      this.solarisService.currentVds = null;
    }
    this.ngxSm.getModal('vdsDevModalLdom').open();
  }

  insertVds() {
    this.LDOM.vds.push(Object.assign({}, this.addVdsDev));
    this.addVdsDev = new SolarisVdsDevs();
    this.ngxSm.getModal('vdsDevModalLdom').close();
  }
  editVds(vds: SolarisVdsDevs) {
    const vdsIndex = this.LDOM.vds.indexOf(this.addVdsDev);
    this.solarisService.currentVds = vds;
    this.openVdsModal();
    //check if modal canceled, don't remove if so
    this.LDOM.vds.splice(vdsIndex, 1);
  }
  editVnic(vnic: SolarisVnic){
    const vnicIndex = this.LDOM.vnic.indexOf(vnic);
    this.solarisService.currentVnic = vnic;
    this.openVnicModal();
    // check if modal canceled, don't remove if so
    this.LDOM.vnic.splice(vnicIndex,1);

  }

  openVnicModal() {
    this.addVnicInherit = true;
    if ( this.solarisService.currentVnic === null ){
      this.vnicModalTaggedVlans = new Array<number>();
      this.modalVnic = new SolarisVnic();
      this.vnicModalVswitch = new SolarisVswitch();
      this.vnicModalVswitches = new Array<SolarisVswitch>();
    } else {
      this.addVnicInherit = false;
      this.modalVnic = this.solarisService.currentVnic;
      this.vnicModalTaggedVlans = this.solarisService.currentVnic.TaggedVlans;
      this.vnicModalUntaggedVlan = this.solarisService.currentVnic.UntaggedVlan;
      this.solarisService.currentVnic = null;
    }
      // Since Devices returned from Device42 don't include custom fields, get the id
      // of the device representing the CDOM and then get it from the API and hydrate
      // the selected CDOM with its custom fields.
    this.automationApiService.getDevicesbyID(this.LDOM.associatedcdom.device_id).subscribe(data => {
      const result = data as SolarisCdom;
      const cdomFull = this.hs.getJsonCustomField(result, 'Metadata') as SolarisCdom;
      this.vnicModalVswitches = cdomFull.vsw;
      this.ngxSm.getModal('vnicModalLdom').open();
    });
  }

  insertVnic() {
    console.log('Here');
    if (this.addVnicInherit) {
      this.modalVnic.TaggedVlans = this.vnicModalVswitch.vlansTagged;
    } else {
      this.modalVnic.TaggedVlans = this.vnicModalTaggedVlans;
    }

    this.modalVnic.UntaggedVlan = this.vnicModalUntaggedVlan;
    this.modalVnic.VirtualSwitchName = this.vnicModalVswitch.vSwitchName;

    this.LDOM.vnic.push(this.hs.deepCopy(this.modalVnic));
    this.ngxSm.getModal('vnicModalLdom').close();
  }

  deleteVds(vdsDev: any) {
    const vdsIndex = this.LDOM.vds.indexOf(vdsDev);
    if (vdsIndex > -1 ) {
      this.LDOM.vds.splice(vdsIndex, 1);
    }
  }
  deleteVnic(vnicDev: any) {
    const vnicIndex = this.LDOM.vnic.indexOf(vnicDev);
    if (vnicIndex > -1 ) {
      this.LDOM.vnic.splice(vnicIndex, 1);
    }
  }

  selectUntaggedVlan(e, vlan: number) {
    if (e.target.checked) {
      if (!this.vnicModalTaggedVlans.includes(vlan)) {
        this.vnicModalTaggedVlans.push(vlan);
      }
    } else if (!e.target.checked) {
      const vlanIndex = this.vnicModalTaggedVlans.indexOf(vlan);

      if (vlanIndex > -1 ) {
        this.vnicModalTaggedVlans.splice(vlanIndex, 1);
      }
    }
  }
  insertVirtualDisks(vds) {
     if (this.LDOM.vds == null) { this.LDOM.vds = new Array<SolarisVdsDevs>(); }
     vds.forEach(thisVds => {
      this.LDOM.vds.push(Object.assign({}, thisVds));
      this.addVdsDev = new SolarisVdsDevs();

     });
     this.ngxSm.getModal('vdsDevModalLdom').close();
     console.log(this.LDOM.vds);
   }
}
