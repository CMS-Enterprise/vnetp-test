import { Component, OnInit } from '@angular/core';
import { PhysicalServer, V1PhysicalServersService, PhysicalServerNetworkPort } from 'api_client';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import ConversionUtil from 'src/app/utils/ConversionUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-physical-server-detail',
  templateUrl: './physical-server-detail.component.html',
})
export class PhysicalServerDetailComponent implements OnInit {
  Id: string;
  PhysicalServer: PhysicalServer;

  networkPorts: PhysicalServerNetworkPort[];
  ConversionUtil = ConversionUtil;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private physicalServerService: V1PhysicalServersService,
    private ngx: NgxSmartModalService,
  ) {}

  getPhysicalServer() {
    this.physicalServerService
      .v1PhysicalServersIdGet({
        id: this.Id,
      })
      .subscribe(data => {
        this.PhysicalServer = data;
      });
  }

  public deletePhysicalServer(ps: PhysicalServer): void {
    const deleteDescription = ps.deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFunction = () => {
      if (!ps.deletedAt) {
        this.physicalServerService
          .v1PhysicalServersIdSoftDelete({
            id: ps.id,
          })
          .subscribe(() => {
            this.getPhysicalServer();
          });
      } else {
        this.physicalServerService
          .v1PhysicalServersIdDelete({
            id: ps.id,
          })
          .subscribe(() => {
            this.router.navigate(['/physical-server'], {
              queryParamsHandling: 'merge',
            });
          });
      }
    };

    SubscriptionUtil.subscribeToYesNoModal(
      new YesNoModalDto(`${deleteDescription} Physical Server?`, `Do you want to ${deleteDescription} physical server "${ps.name}"?`),
      this.ngx,
      deleteFunction,
    );
  }

  restorePhysicalServer(ps: PhysicalServer) {
    if (ps.deletedAt) {
      this.physicalServerService
        .v1PhysicalServersIdRestorePatch({
          id: ps.id,
        })
        .subscribe(() => {
          this.getPhysicalServer();
        });
    }
  }

  ngOnInit() {
    this.Id = this.route.snapshot.paramMap.get('id');
    this.getPhysicalServer();
  }
}
