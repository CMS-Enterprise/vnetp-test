import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { SolarisService } from '../solaris-services/solaris-service.service';
import { Router } from '@angular/router';
import { SolarisLdomResponse } from 'src/app/models/interfaces/solaris-load-balancer.interface';
import { SolarisCdomResponse } from 'src/app/models/interfaces/solaris-cdom-response.interface';
import { SolarisCdom } from 'src/app/models/solaris/solaris-cdom';
import { SolarisLdom } from 'src/app/models/solaris/solaris-ldom';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-solaris-cdom-list',
  templateUrl: './solaris-cdom-list.component.html'
})
export class SolarisCdomListComponent implements OnInit {
  devices: Array<any>;
  returnDevices: Array<any>;
  returnLDOMs: Array<any>;
  CDOMDeviceArray: Array<any>;
  associatedLdoms: Array<any>;
  finishedAssociatedLdomList = false;
  LdomCountDict: {[k: string]: any} = {};
  deleteCdomConfirm: string;
  cdomToDelete: SolarisCdom;

  constructor(
    private automationApiService: AutomationApiService,
    private solarisService: SolarisService,
    private router: Router,
    private ngxSm: NgxSmartModalService
  ) {}

  ngOnInit() {
    this.automationApiService.getCDoms()
      .subscribe(data => {
        const cdomResponse = data as SolarisCdomResponse;
        this.CDOMDeviceArray = cdomResponse.Devices;
        this.CDOMDeviceArray.forEach(d => {
          d.ldomCount = this.getLdomsForCDom(d.name);
        });
    });
    console.log(this.CDOMDeviceArray);
  }

  getLdomsForCDom(name: string) {
    this.automationApiService.getLDomsForCDom(name)
    .subscribe(data => {
      let length = 0;
      const ldomForCDomResponse = data as SolarisLdomResponse;
      if ( ldomForCDomResponse.total_count != null) {
        length = ldomForCDomResponse.total_count;
      }
      //return length;
       this.LdomCountDict[`${name}`] = length; 
    });
  }
  getLdomCount(name: string){
   return this.LdomCountDict[`${name}`];
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
