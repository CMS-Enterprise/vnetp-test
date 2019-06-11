import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { SolarisService } from '../solaris-services/solaris-service.service';
import { Router } from '@angular/router';
import { SolarisLdomResponse } from 'src/app/models/interfaces/solaris-load-balancer.interface';
import { SolarisCdomResponse } from 'src/app/models/interfaces/solaris-cdom-response.interface';
import { SolarisCdom } from 'src/app/models/solaris/solaris-cdom';
import { SolarisLdom } from 'src/app/models/solaris/solaris-ldom';

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
  associatedLdoms: Array<any>;
  finishedAssociatedLdomList = false;

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
        console.log(this.CDOMDeviceArray);
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

  deleteCdom(device: SolarisCdom){ 
    //returns an array of device ids to be deleted
    this.automationApiService.getLDomsForCDom(device.name).subscribe(data => {
      const result = data as any;
      const toDeleteLdoms = result.Devices as Array<SolarisLdom>;
      let toDeleteIDs = new Array<any>();
      //push CDOM id
      toDeleteIDs.push(device.device_id);
      // check if any LDOM ids to add.
      if( toDeleteLdoms.length >= 1) {
        //push each LDOM id to array
        toDeleteLdoms.forEach(ldom => {
            toDeleteIDs.push(ldom.device_id);
        });
      }
      //TODO: if there are any LDOMs add an "are you sure" prompt
      //call the Delete-Device playbook
      toDeleteIDs.forEach(id => {
        const extra_vars: {[k: string]: any} = {};
        extra_vars.id = id;
        const body = { extra_vars };
        this.automationApiService.launchTemplate('delete-device', body, true).subscribe();
      });
      this.router.navigate(['/solaris/ldom/list']);

    });
  }
}
