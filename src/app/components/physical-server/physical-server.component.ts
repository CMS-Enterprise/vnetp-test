import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { V1DatacentersService, V1PhysicalServersService, PhysicalServer } from 'api_client';
import { PhysicalServerModalDto } from 'src/app/models/physical-server/physical-server-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { EntityService } from 'src/app/services/entity.service';

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
    private entityService: EntityService,
    private ngx: NgxSmartModalService,
    private datacenterContextService: DatacenterContextService,
    private datacenterService: V1DatacentersService,
    private physicalServerService: V1PhysicalServersService,
  ) {}

  public getPhysicalServers(): void {
    this.physicalServerService.v1PhysicalServersGet({ filter: `datacenterId||eq||${this.datacenterId}` }).subscribe(data => {
      this.physicalServers = data;
    });
  }

  public openPhysicalServerModal(modalMode: ModalMode, physicalServer?: PhysicalServer) {
    if (modalMode === ModalMode.Edit && !physicalServer) {
      throw new Error('Physical Server required');
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
    this.entityService.deleteEntity(physicalServer, {
      entityName: 'Physical Server',
      delete$: this.physicalServerService.v1PhysicalServersIdDelete({ id: physicalServer.id }),
      softDelete$: this.physicalServerService.v1PhysicalServersIdSoftDelete({ id: physicalServer.id }),
      onSuccess: () => this.getPhysicalServers(),
    });
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
