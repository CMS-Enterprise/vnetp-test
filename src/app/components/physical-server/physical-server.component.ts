import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { V1DatacentersService, V1PhysicalServersService, PhysicalServer } from 'api_client';
import { PhysicalServerModalDto } from 'src/app/models/physical-server/physical-server-modal-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-physical-server',
  templateUrl: './physical-server.component.html',
})
export class PhysicalServerComponent implements OnInit, OnDestroy {
  public ModalMode = ModalMode;
  public currentPhysicalServersPage = 1;
  public datacenterId: string;
  public perPage = 20;
  public physicalServers: PhysicalServer[] = [];

  private currentDatacenterSubscription: Subscription;
  private physicalServerModalSubscription: Subscription;

  constructor(
    private ngx: NgxSmartModalService,
    private datacenterContextService: DatacenterContextService,
    private datacenterService: V1DatacentersService,
    private physicalServerService: V1PhysicalServersService,
  ) {}

  public getPhysicalServers(): void {
    this.datacenterService
      .v1DatacentersIdGet({
        id: this.datacenterId,
        join: 'physicalServers',
      })
      .subscribe(data => {
        this.physicalServers = data.physicalServers;
      });
  }

  public openPhysicalServerModal(modalMode: ModalMode, physicalServer?: PhysicalServer) {
    if (modalMode === ModalMode.Edit && !physicalServer) {
      throw new Error('Physical Server required.');
    }

    const dto = new PhysicalServerModalDto();
    dto.ModalMode = modalMode;
    dto.DatacenterId = this.datacenterId;

    if (modalMode === ModalMode.Edit) {
      dto.PhysicalServer = physicalServer;
    }

    this.physicalServerModalSubscription = this.subscribeToPhysicalServerModal();
    this.datacenterContextService.lockDatacenter();
    this.ngx.setModalData(dto, 'physicalServerModal');
    this.ngx.getModal('physicalServerModal').open();
  }

  private subscribeToPhysicalServerModal(): Subscription {
    return this.ngx.getModal('physicalServerModal').onAnyCloseEvent.subscribe(() => {
      this.getPhysicalServers();
      this.ngx.resetModalData('physicalServerModal');
      this.datacenterContextService.unlockDatacenter();
    });
  }

  public deletePhysicalServer(physicalServer: PhysicalServer): void {
    const { deletedAt, id, name } = physicalServer;
    const deleteDescription = deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFunction = () => {
      if (!deletedAt) {
        this.physicalServerService.v1PhysicalServersIdSoftDelete({ id }).subscribe(() => {
          this.getPhysicalServers();
        });
      } else {
        this.physicalServerService.v1PhysicalServersIdDelete({ id }).subscribe(() => {
          this.getPhysicalServers();
        });
      }
    };

    SubscriptionUtil.subscribeToYesNoModal(
      new YesNoModalDto(`${deleteDescription} Physical Server?`, `Do you want to ${deleteDescription} physical server "${name}"?`),
      this.ngx,
      deleteFunction,
    );
  }

  public restorePhysicalServer(physicalServer: PhysicalServer): void {
    if (!physicalServer.deletedAt) {
      return;
    }
    this.physicalServerService
      .v1PhysicalServersIdRestorePatch({
        id: physicalServer.id,
      })
      .subscribe(() => {
        this.getPhysicalServers();
      });
  }

  ngOnInit(): void {
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.datacenterId = cd.id;
        this.getPhysicalServers();
      }
    });
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.physicalServerModalSubscription, this.currentDatacenterSubscription]);
  }
}
