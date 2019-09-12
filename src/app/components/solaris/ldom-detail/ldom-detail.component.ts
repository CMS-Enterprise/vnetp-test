import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { HelpersService } from 'src/app/services/helpers.service';
import { SolarisLdom } from 'src/app/models/solaris/solaris-ldom';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-ldom-detail',
  templateUrl: './ldom-detail.component.html'
})
export class LdomDetailComponent implements OnInit {
  Ldom: SolarisLdom;
  LdomMetadata: SolarisLdom;
  Id: string;
  navIndex = 0;

  deleteLdomConfirm = '';

  constructor(
    private route: ActivatedRoute,
    private automationApiService: AutomationApiService,
    private hs: HelpersService,
    public ngxSm: NgxSmartModalService,
    private router: Router) { }

  ngOnInit() {
    this.Id = this.route.snapshot.paramMap.get('id');
    this.getLdom();
  }

  getLdom() {
    this.automationApiService.getDevicesbyID(this.Id).subscribe(
      data => {
        this.Ldom = data as SolarisLdom;
        this.LdomMetadata = this.hs.getJsonCustomField(this.Ldom, 'Metadata') as SolarisLdom;
      }
    )
  }
  deleteLdom() {
    if (this.deleteLdomConfirm !== 'DELETE') { return; }

    const extra_vars: {[k:string]: any} = {};
    extra_vars.id = this.Ldom.device_id;
    const body = { extra_vars };
    this.automationApiService.launchTemplate('delete-device', body, true).subscribe();
    this.router.navigate(['/solaris/ldom/list']);
   }

}
