import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { V1DatacentersService, V1PhysicalServersService, PhysicalServer } from 'api_client';
import { PhysicalServerModalDto } from 'src/app/models/physical-server/physical-server-modal-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { SubscriptionUtil } from 'src/app/utils/subscription.util';

@Component({
  selector: 'app-physical-server',
  templateUrl: './physical-server.component.html',
})
export class PhysicalServerComponent implements OnInit, OnDestroy {
  physicalServers: Array<PhysicalServer>;
  physicalServerModalSubscription: Subscription;
  currentDatacenterSubscription: Subscription;
  datacenterId: string;

  currentPhysicalServersPage = 1;
  perPage = 20;
  ModalMode = ModalMode;

  constructor(
    private ngx: NgxSmartModalService,
    private datacenterContextService: DatacenterContextService,
    private datacenterService: V1DatacentersService,
    private physicalServerService: V1PhysicalServersService,
  ) {}

  getPhysicalServers() {
    this.datacenterService
      .v1DatacentersIdGet({
        id: this.datacenterId,
        join: 'physicalServers',
      })
      .subscribe(data => {
        this.physicalServers = data.physicalServers;
      });
  }

  createPhysicalServer() {
    this.openPhysicalServerModal(ModalMode.Create);
  }

  openPhysicalServerModal(modalMode: ModalMode, ps?: PhysicalServer) {
    if (modalMode === ModalMode.Edit && !ps) {
      throw new Error('Physical Server required.');
    }

    const dto = new PhysicalServerModalDto();
    dto.ModalMode = modalMode;
    dto.DatacenterId = this.datacenterId;

    if (modalMode === ModalMode.Edit) {
      dto.PhysicalServer = ps;
    }

    this.subscribeToPhysicalServerModal();
    this.datacenterContextService.lockDatacenter();
    this.ngx.setModalData(dto, 'physicalServerModal');
    this.ngx.getModal('physicalServerModal').open();
  }

  subscribeToPhysicalServerModal() {
    this.physicalServerModalSubscription = this.ngx
      .getModal('physicalServerModal')
      .onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
        this.getPhysicalServers();
        this.ngx.resetModalData('physicalServerModal');
        this.datacenterContextService.unlockDatacenter();
      });
  }

  deletePhysicalServer(ps: PhysicalServer) {
    const deleteDescription = ps.deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFunction = () => {
      if (!ps.deletedAt) {
        this.physicalServerService.v1PhysicalServersIdSoftDelete({ id: ps.id }).subscribe(data => {
          this.getPhysicalServers();
        });
      } else {
        this.physicalServerService.v1PhysicalServersIdDelete({ id: ps.id }).subscribe(data => {
          this.getPhysicalServers();
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
          this.getPhysicalServers();
        });
    }
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

  private unsubAll() {
    SubscriptionUtil.unsubscribe([this.physicalServerModalSubscription, this.currentDatacenterSubscription]);
  }

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.datacenterId = cd.id;
        this.getPhysicalServers();
      }
    });
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
