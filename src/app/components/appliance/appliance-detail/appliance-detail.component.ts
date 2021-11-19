import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { V1AppliancesService, Appliance, ApplianceNetworkPort } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import ConversionUtil from 'src/app/utils/ConversionUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-appliance-detail',
  templateUrl: './appliance-detail.component.html',
})
export class ApplianceDetailComponent implements OnInit {
  Id: string;
  Appliance: Appliance;
  networkPorts: Array<ApplianceNetworkPort>;

  ConversionUtil = ConversionUtil;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applianceService: V1AppliancesService,
    private ngx: NgxSmartModalService,
  ) {}

  getAppliance() {
    this.applianceService
      .getOneAppliance({
        id: this.Id,
      })
      .subscribe(data => {
        this.Appliance = data;
      });
  }

  deleteAppliance(a: Appliance) {
    const deleteDescription = a.deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFunction = () => {
      if (!a.deletedAt) {
        this.applianceService
          .softDeleteOneAppliance({
            id: a.id,
          })
          .subscribe(() => {
            this.getAppliance();
          });
      } else {
        this.applianceService
          .deleteOneAppliance({
            id: a.id,
          })
          .subscribe(() => {
            this.router.navigate(['/appliance'], {
              queryParamsHandling: 'merge',
            });
          });
      }
    };

    SubscriptionUtil.subscribeToYesNoModal(
      new YesNoModalDto(`${deleteDescription} Appliance?`, `Do you want to ${deleteDescription} appliance "${a.name}"?`),
      this.ngx,
      deleteFunction,
    );
  }

  restoreAppliance(a: Appliance) {
    if (a.deletedAt) {
      this.applianceService
        .restoreOneAppliance({
          id: a.id,
        })
        .subscribe(() => {
          this.getAppliance();
        });
    }
  }

  ngOnInit() {
    this.Id = this.route.snapshot.paramMap.get('id');
    this.getAppliance();
  }
}
