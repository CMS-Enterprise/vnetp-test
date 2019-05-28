import { Component, OnInit } from '@angular/core';
import { SolarisCdom } from '../../../models/solaris-cdom';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { SolarisServiceService } from '../solaris-services/solaris-service.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService } from 'src/app/services/message.service';
import { Vrf } from 'src/app/models/d42/vrf';
import { LogicalInterface } from 'src/app/models/network/logical-interface';
import { PhysicalInterface } from 'src/app/models/network/physical-interface';
import { HelpersService } from 'src/app/services/helpers.service';
import { NetworkInterfacesDto } from 'src/app/models/network/network-interfaces-dto';
import { Subnet, SubnetResponse } from 'src/app/models/d42/subnet';
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
  LogicalInterfaces: Array<LogicalInterface>;
  PhysicalInterfaces: Array<PhysicalInterface>;
  vrfs: Array<Vrf>;
  dirty: boolean;
  currentVrf: Vrf;
  Subnets: Array<Subnet>;

  // Added as type any
  inputCDOMVDSDevs: any;
  vds: any;
  cdomInput: any;
  launchLDOMJobs: any;

  constructor(
    private automationApiService: AutomationApiService,
    private solarisService: SolarisServiceService,
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService,
    private hs: HelpersService
    ) {
    this.CDOM = new SolarisCdom();
  }
  setCurrentCDOM(cdomInput: SolarisCdom) {
    this.CDOM = cdomInput;
  }
  getVrfs() {
    this.LogicalInterfaces = new Array<LogicalInterface>();

    this.automationApiService.getVrfs().subscribe(data => {
     data.forEach(d => {
      const dto = this.hs.getJsonCustomField(d, 'network_interfaces') as NetworkInterfacesDto;
      console.log('here');
      dto.LogicalInterfaces.forEach(l => {
        this.LogicalInterfaces.push(l);
      });
     });
     console.log('Logical Interface', this.LogicalInterfaces);
    });
  }

  ngOnInit() {
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
        this.CDOMDeviceArray.push(new SolarisCdom());
       }
       // this.vnets = this.CDOMDeviceArray
      });
      //  this.CDOMDeviceArray = this.returnDevices[0].value;
    });
    this.getVrfs();
    console.log(this.vrfs);
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
    this.automationApiService.launchTemplate(`save-device`, body).subscribe();
    this.messageService.filter('Job Launched');
    this.router.navigate(['/solaris']);
  }
}
