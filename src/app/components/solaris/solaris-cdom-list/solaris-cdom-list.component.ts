import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { SolarisCdomResponse } from '../../../models/solaris/solaris-cdom';
import { SolarisLdomResponse } from '../../../models/solaris/solaris-ldom';
import { SolarisService } from '../solaris-services/solaris-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-solaris-cdom-list',
  templateUrl: './solaris-cdom-list.component.html',
  styleUrls: ['./solaris-cdom-list.component.css']
})
export class SolarisCdomListComponent implements OnInit {
  devices: Array<any>;
  returnDevices: Array<any>;
  returnLDOMs: Array<any>;
  CDOMDeviceArray: Array<any>;

  constructor(
    private automationApiService: AutomationApiService,
    private solarisService: SolarisService,
    private router: Router

  ) {}

  ngOnInit() {
    this.automationApiService.getCDoms()
      .subscribe(data => {
        const cdomResponse = data as SolarisCdomResponse;
        this.CDOMDeviceArray = cdomResponse.Devices;
    });
  }

  getLdomsForCDom(name: string) {
    console.log(name);
    this.automationApiService.getLDomsForCDom(name)
    .subscribe(data => {
      const ldomForCDomResponse = data as SolarisLdomResponse;
      this.returnLDOMs = ldomForCDomResponse.Devices;
    });
  }

  addLdom(deviceName: string) {
    this.solarisService.parentCdom = deviceName;
    this.router.navigate(['/solaris-ldom-create']);
  }
}
