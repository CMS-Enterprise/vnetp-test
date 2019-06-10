import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { SolarisService } from '../solaris-services/solaris-service.service';
import { Router } from '@angular/router';
import { SolarisLdomResponse } from 'src/app/models/interfaces/solaris-load-balancer.interface';
import { SolarisCdomResponse } from 'src/app/models/interfaces/solaris-cdom-response.interface';

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
    this.automationApiService.getLDomsForCDom(name)
    .subscribe(data => {
      const ldomForCDomResponse = data as SolarisLdomResponse;
      this.returnLDOMs = ldomForCDomResponse.Devices;
    });
  }

  addLdom(device: any) {
    this.solarisService.parentCdom = device;
    this.router.navigate(['/solaris/ldom/create']);
  }
  editCdom(device: any){
    this.solarisService.currentCdom = device;
    this.router.navigate(['/solaris/cdom/create']);
  }
}
