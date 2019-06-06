import { Component, OnInit, HostListener } from '@angular/core';
import { SolarisCdom } from '../../../models/solaris/solaris-cdom';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { SolarisService } from '../solaris-services/solaris-service.service';
import { Router } from '@angular/router';
import { Vrf } from 'src/app/models/d42/vrf';
import { LogicalInterface } from 'src/app/models/network/logical-interface';
import { HelpersService } from 'src/app/services/helpers.service';
import { NetworkInterfacesDto } from 'src/app/models/network/network-interfaces-dto';
import { SolarisCdomResponse } from 'src/app/models/interfaces/solaris-cdom-response.interface';
import { SolarisVswitch } from 'src/app/models/solaris/solaris-vswitch';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { PendingChangesGuard } from 'src/app/guards/pending-changes.guard';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-solaris-cdom-create',
  templateUrl: './solaris-cdom-create.component.html',
  styleUrls: ['./solaris-cdom-create.component.css']
})
export class SolarisCdomCreateComponent implements OnInit, PendingChangesGuard {
  CDOM: SolarisCdom;
  CDOMDeviceArray: Array<any>;
  clonefromCDOM: SolarisCdom;
  LogicalInterfaces: Array<LogicalInterface>;
  vrfs: Array<Vrf>;
  inputCDOMVDSDevs: any;
  vds: any;
  cdomInput: any;
  cpuCountArray: Array<number>;
  ramCountArray: Array<number>;
  addVdsDev: any;
  modalVswitch: SolarisVswitch;
  modalAddTaggedVlan: number;
  dirty: boolean;

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return !this.dirty;
  }

  constructor(
    private ngxSm: NgxSmartModalService,
    private automationApiService: AutomationApiService,
    private solarisService: SolarisService,
    private router: Router,
    private hs: HelpersService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  cloneCdom() {
    this.automationApiService.getDevicesbyID(this.cdomInput.device_id).subscribe(data => {
      const result = data as SolarisCdom;
      this.CDOM = this.hs.deepCopy(this.hs.getJsonCustomField(result, 'Metadata') as SolarisCdom);
    });
  }

  getVrfs() {
    this.LogicalInterfaces = new Array<LogicalInterface>();

    this.automationApiService.getVrfs().subscribe(data => {
      data.forEach(d => {
        const dto = this.hs.getJsonCustomField(d, 'network_interfaces'
        ) as NetworkInterfacesDto;

        if (dto) {
        dto.LogicalInterfaces.forEach(l => {
          this.LogicalInterfaces.push(l);
        });
      }
      });
    });
  }

  ngOnInit() {
    this.dirty = true;
    this.CDOM = new SolarisCdom();
    this.CDOM.vccname = 'primary-vcc0';
    this.CDOM.vnet = 'vnet0';
    this.CDOM.vccports = '5000-5100';
    this.CDOM.net_device = 'net0';
    this.automationApiService.getCDoms().subscribe(data => {
      const cdomResponse = data as SolarisCdomResponse;
      this.CDOMDeviceArray = cdomResponse.Devices;
    });
    this.modalVswitch = new SolarisVswitch();
    this.modalVswitch.vlansTagged = new Array<number>();
    this.CDOM.vsw = new Array<SolarisVswitch>();
    this.CDOM.vds = new Array<any>();
    this.cpuCountArray = this.solarisService.buildNumberArray(2, 128, 2);
    this.ramCountArray = this.solarisService.buildNumberArray(0, 512, 32);
    this.LogicalInterfaces = new Array<LogicalInterface>();
    this.getVrfs();
  }

  moveObjectPosition(value: number, obj, objArray) {
    this.solarisService.moveObjectPosition(value, obj, objArray);
  }
  launchCDOMJobs() {
    // TODO: Tie to reactive form pristine.
    this.dirty = false;
    const extra_vars: { [k: string]: any } = {};
    this.CDOM.customer_name = this.authService.currentUserValue.CustomerName;
    this.CDOM.devicetype = 'solaris_cdom';
    extra_vars.CDOM = this.CDOM;

    const body = { extra_vars };
    this.automationApiService.launchTemplate(`save-cdom`, body, true).subscribe();
    this.router.navigate(['/solaris/cdom/list']);
  }

  openVswitchModal() {
    this.modalVswitch = new SolarisVswitch();
    this.modalVswitch.vlansTagged = new Array<number>();
    this.ngxSm.getModal('vswitchModalCdom').open();
  }

  insertVswitch() {
    if (this.modalVswitch.vlansTagged.includes(this.modalVswitch.vlansUntagged)){
      this.toastr.error('Native VLAN cannot be in Tagged VLANs.')
      return;
    }

    this.CDOM.vsw.push(this.hs.deepCopy(this.modalVswitch));
    this.ngxSm.getModal('vswitchModalCdom').close();
  }

  deletevSwitch(vsw: any) {
    const vswIndex = this.CDOM.vsw.indexOf(vsw);
    if (vswIndex > -1) {
      this.CDOM.vsw.splice(vswIndex, 1);
    }
  }

  vswitchModalAddTaggedVlan() {

    if (this.modalVswitch.vlansTagged.includes(this.modalAddTaggedVlan)) {
      this.toastr.error('Duplicate Tagged VLAN');
      return;
    }

    if (this.modalVswitch.vlansUntagged === this.modalAddTaggedVlan) {
      this.toastr.error('Native VLAN cannot be added to Tagged VLANs');
      return;
    }

    this.modalVswitch.vlansTagged.push(this.modalAddTaggedVlan);
    this.modalAddTaggedVlan = null;
  }

  vswitchModalRemoveTaggedVlan(vlan: number) {
    const vlanIndex = this.modalVswitch.vlansTagged.indexOf(vlan);

    if (vlanIndex > -1) {
      this.modalVswitch.vlansTagged.splice(vlanIndex, 1);
    }
  }
}
