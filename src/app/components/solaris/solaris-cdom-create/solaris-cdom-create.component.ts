import { Component, OnInit } from '@angular/core';
import { SolarisCdom } from '../../../models/solaris/solaris-cdom';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { SolarisService } from '../solaris-services/solaris-service.service';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/services/message.service';
import { Vrf } from 'src/app/models/d42/vrf';
import { LogicalInterface } from 'src/app/models/network/logical-interface';
import { HelpersService } from 'src/app/services/helpers.service';
import { NetworkInterfacesDto } from 'src/app/models/network/network-interfaces-dto';
import { SolarisCdomResponse } from 'src/app/models/interfaces/solaris-cdom-response.interface';
import { SolarisVswitch } from 'src/app/models/solaris/solaris-vswitch';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-solaris-cdom-create',
  templateUrl: './solaris-cdom-create.component.html',
  styleUrls: ['./solaris-cdom-create.component.css']
})
export class SolarisCdomCreateComponent implements OnInit {
  CDOM: SolarisCdom;
  CDOMDeviceArray: Array<any>;
  clonefromCDOM: SolarisCdom;
  LogicalInterfaces: Array<LogicalInterface>;
  vrfs: Array<Vrf>;
  inputCDOMVDSDevs: any;
  vds: any;
  cdomInput: any;
  launchLDOMJobs: any;
  addVdsDev: any;
  addVswitch: SolarisVswitch;

  cpuCountArray: Array<number>;
  ramCountArray: Array<number>;

  constructor(
    private ngxSm: NgxSmartModalService,
    private automationApiService: AutomationApiService,
    private solarisService: SolarisService,
    private router: Router,
    private messageService: MessageService,
    private hs: HelpersService,
    private authService: AuthService
    ) {
  }
  cloneCdom() {
    this.CDOM = this.cdomInput;
  }

  getVrfs() {
    this.LogicalInterfaces = new Array<LogicalInterface>();

    this.automationApiService.getVrfs().subscribe(data => {
     data.forEach(d => {
      const dto = this.hs.getJsonCustomField(d, 'network_interfaces') as NetworkInterfacesDto;
      dto.LogicalInterfaces.forEach(l => {
        this.LogicalInterfaces.push(l);
      });
     });
    });
  }

  ngOnInit() {
    this.CDOM = new SolarisCdom();
    this.CDOM.vccname = 'primary-vcc0';
    this.CDOM.vnet = 'vnet0';
    this.CDOM.vccports = '5000-5100';
    this.CDOM.net_device = 'net0';
    this.automationApiService.getCDoms()
      .subscribe(data => {
        const cdomResponse = data as SolarisCdomResponse;
        this.CDOMDeviceArray = cdomResponse.Devices;
    });
    this.getVrfs();
    this.addVswitch = new SolarisVswitch();
    this.CDOM.vsw = new Array<SolarisVswitch>();
    this.CDOM.vds = new Array<any>();
    this.cpuCountArray = this.solarisService.buildNumberArray(2, 128, 2);
    this.ramCountArray = this.solarisService.buildNumberArray(0, 512, 32);
  }

  moveObjectPosition(value: number, obj, objArray) {
   this.solarisService.moveObjectPosition(value, obj, objArray);
  }
  launchCDOMJobs() {
    const extra_vars: {[k: string]: any} = {};
    this.CDOM.customer_name = this.authService.currentUserValue.CustomerName;
    this.CDOM.devicetype = 'solaris_cdom';
    extra_vars.CDOM = this.CDOM;

    const body = { extra_vars };
    this.automationApiService.launchTemplate(`save-cdom`, body).subscribe();
    this.messageService.filter('Job Launched');
    this.router.navigate(['/solaris-cdom-list']);
  }
  openVswitchModal() {
    this.ngxSm.getModal('vswitchModalCdom').open();
  }

  insertVswitch() {
    this.CDOM.vsw.push(Object.assign({}, this.addVswitch));
    this.addVswitch = new SolarisVswitch();
    this.ngxSm.getModal('vswitchModalCdom').close();
  }

  deletevSwitch(vsw: any) {
    const vswIndex = this.CDOM.vsw.indexOf(vsw);
    if (vswIndex > -1 ) {
      this.CDOM.vsw.splice(vswIndex, 1);
    }
  }
}
