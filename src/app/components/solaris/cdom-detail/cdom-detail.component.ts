import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SolarisCdom } from 'src/app/models/solaris/solaris-cdom';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { HelpersService } from 'src/app/services/helpers.service';
import { SolarisLdom } from 'src/app/models/solaris/solaris-ldom';
import { Router } from '@angular/router';
import { NgxSmartModalService } from 'ngx-smart-modal';
@Component({
  selector: 'app-cdom-detail',
  templateUrl: './cdom-detail.component.html',
  styleUrls: ['./cdom-detail.component.css']
})
export class CdomDetailComponent implements OnInit {
  Id: string;
  Cdom: SolarisCdom;
  CdomMetadata: SolarisCdom;

  navIndex = 0;

  deleteCdomConfirm: string;

  constructor(
      private route: ActivatedRoute,
      private automationApiService: AutomationApiService, 
      private hs: HelpersService,
      public ngxSm: NgxSmartModalService,
      private router: Router) { }

  ngOnInit() {
    this.Id = this.route.snapshot.paramMap.get('id');
    this.getCdom();
  }

  getCdom() {
    this.automationApiService.getDevicesbyID(this.Id).subscribe(
      data => {
        this.Cdom = data as SolarisCdom;
        this.CdomMetadata = this.hs.getJsonCustomField(this.Cdom, 'Metadata') as SolarisCdom;
      }
    );

  }
  deleteCdom() { 
    if (this.deleteCdomConfirm !== 'DELETE') { return; }

    //returns an array of device ids to be deleted
    this.automationApiService.getLDomsForCDom(this.Cdom.name).subscribe(data => {
      const result = data as any;
      const toDeleteLdoms = result.Devices as Array<SolarisLdom>;
      let toDeleteIDs = new Array<any>();
      //push CDOM id
      toDeleteIDs.push(this.Cdom.device_id);
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
        this.automationApiService.launchTemplate(`delete-device`, body, true).subscribe();
      });
      this.router.navigate(['/solaris/cdom/list']);

    });
  }
}
