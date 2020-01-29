import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { V1AppliancesService, Appliance } from 'api_client';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';

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

  deleteAppliance(a: Appliance) {
    const deleteDescription = a.deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFunction = () => {
      if (!a.deletedAt) {
        this.applianceService
          .v1AppliancesIdSoftDelete({
            id: a.id,
          })
          .subscribe(data => {
            this.getAppliance();
          });
      } else {
        this.applianceService
          .v1AppliancesIdDelete({
            id: a.id,
          })
          .subscribe(data => {
            this.router.navigate(['/appliance'], {
              queryParamsHandling: 'merge',
            });
          });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(
        `${deleteDescription} Appliance?`,
        `Do you want to ${deleteDescription} appliance "${a.name}"?`,
      ),
      deleteFunction,
    );
  }

  restoreAppliance(a: Appliance) {
    if (a.deletedAt) {
      this.applianceService
        .v1AppliancesIdRestorePatch({
          id: a.id,
        })
        .subscribe(data => {
          this.getAppliance();
        });
    }
  }

  convertBytesToGb(val) {
    const convertedVal = val / 1000000000;

    return convertedVal;
  }

  private confirmDeleteObject(
    modalDto: YesNoModalDto,
    deleteFunction: () => void,
  ) {
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();
    const yesNoModalSubscription = this.ngx
      .getModal('yesNoModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
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

    this.getAppliance();
  }
}
