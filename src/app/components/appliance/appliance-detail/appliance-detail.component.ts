import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { V1AppliancesService, Appliance } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-appliance-detail',
  templateUrl: './appliance-detail.component.html',
  styleUrls: ['./appliance-detail.component.css'],
})
export class ApplianceDetailComponent implements OnInit {
  Id: string;
  Appliance: Appliance;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applianceService: V1AppliancesService,
    private ngx: NgxSmartModalService,
  ) {}

  getAppliance() {
    this.applianceService
      .v1AppliancesIdGet({
        id: this.Id,
      })
      .subscribe(data => {
        this.Appliance = data;
      });
  }

  convertBytesToGb(val) {
    let convertedVal = val / 1000000000;

    return convertedVal;
  }

  ngOnInit() {
    this.Id = this.route.snapshot.paramMap.get('id');

    this.getAppliance();
  }
}
