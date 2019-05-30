import { Component, OnInit } from '@angular/core';
import { SolarisCdom, SolarisCdomResponse } from '../../../models/solaris-cdom';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { SolarisServiceService } from '../solaris-services/solaris-service.service';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/services/message.service';
import { Vrf } from 'src/app/models/d42/vrf';
import { LogicalInterface } from 'src/app/models/network/logical-interface';
import { HelpersService } from 'src/app/services/helpers.service';
import { NetworkInterfacesDto } from 'src/app/models/network/network-interfaces-dto';

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

  // Added as type any
  inputCDOMVDSDevs: any;
  vds: any;
  cdomInput: any;
  launchLDOMJobs: any;

  constructor(
    private automationApiService: AutomationApiService,
    private solarisService: SolarisServiceService,
    private router: Router,
    private messageService: MessageService,
    private hs: HelpersService
    ) {
  }
  setCurrentCDOM(cdomInput: SolarisCdom) {
    this.CDOM = cdomInput;
    console.log(cdomInput);
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
    this.CDOM.add_vsw = 'primary-vsw';
    this.CDOM.vccname = 'primary-vcc';
    this.CDOM.vds = 'primary-vds0';
    this.automationApiService.getCDoms()
      .subscribe(data => {
        const cdomResponse = data as SolarisCdomResponse;
        this.CDOMDeviceArray = cdomResponse.Devices;
    });
    this.getVrfs();
  }

  moveObjectPosition(value: number, obj, objArray) {
   this.solarisService.moveObjectPosition(value, obj, objArray);
  }
  launchCDOMJobs() {

    const extra_vars: {[k: string]: any} = {};
    // static listing of commands to be ran, needed for Solaris automation
    this.CDOM.devicetype = 'solaris_cdom';
    // FIXME: [jvf] move hardcodes out of UI
    this.CDOM.cmds = 'add_vds,add_vcc,set_vcpu,set_mem,add_vsw,add_config';
    extra_vars.CDOM = this.CDOM;

    const body = { extra_vars };
    this.automationApiService.launchTemplate(`save-cdom`, body).subscribe();
    this.messageService.filter('Job Launched');
    this.router.navigate(['/solaris']);
  }
}
