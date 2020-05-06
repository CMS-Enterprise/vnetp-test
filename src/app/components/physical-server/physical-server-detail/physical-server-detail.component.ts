import { Component, OnInit } from '@angular/core';
import { PhysicalServer, V1PhysicalServersService, PhysicalServerNetworkPort } from 'api_client';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';

@Component({
  selector: 'app-physical-server-detail',
  templateUrl: './physical-server-detail.component.html',
})
export class PhysicalServerDetailComponent implements OnInit {
  Id: string;
  PhysicalServer: PhysicalServer;

  networkPorts: PhysicalServerNetworkPort[];

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

  deletePhysicalServer(ps: PhysicalServer) {
    const deleteDescription = ps.deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFunction = () => {
      if (!ps.deletedAt) {
        this.physicalServerService
          .v1PhysicalServersIdSoftDelete({
            id: ps.id,
          })
          .subscribe(data => {
            this.getPhysicalServer();
          });
      } else {
        this.physicalServerService
          .v1PhysicalServersIdDelete({
            id: ps.id,
          })
          .subscribe(data => {
            this.router.navigate(['/physical-server'], {
              queryParamsHandling: 'merge',
            });
          });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(`${deleteDescription} Physical Server?`, `Do you want to ${deleteDescription} physical server "${ps.name}"?`),
      deleteFunction,
    );
  }

  restorePhysicalServer(ps: PhysicalServer) {
    if (ps.deletedAt) {
      this.physicalServerService
        .v1PhysicalServersIdRestorePatch({
          id: ps.id,
        })
        .subscribe(data => {
          this.getPhysicalServer();
        });
    }
  }

  convertBytesToGb(val) {
    const convertedVal = val / 1000000000;

    return convertedVal;
  }

  private confirmDeleteObject(modalDto: YesNoModalDto, deleteFunction: () => void) {
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();
    const yesNoModalSubscription = this.ngx.getModal('yesNoModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      const data = modal.getData() as YesNoModalDto;
      modal.removeData();
      if (data && data.modalYes) {
        deleteFunction();
      }
      yesNoModalSubscription.unsubscribe();
    });
  }

  ngOnInit() {
    this.Id = this.route.snapshot.paramMap.get('id');

    this.getPhysicalServer();
  }
}
