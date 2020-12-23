import { AfterViewInit, Component, Input, OnDestroy, OnInit, TemplateRef, Type, ViewChild } from '@angular/core';
import { LoadBalancerVirtualServer, Tier, V1LoadBalancerVirtualServersService, VirtualServerImportDto } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { EntityService } from 'src/app/services/entity.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { VirtualServerModalDto } from '../virtual-server-modal/virtual-server-modal.dto';

export interface VirtualServerView extends LoadBalancerVirtualServer {
  defaultPoolName: string;
  state: string;
}

@Component({
  selector: 'app-virtual-server-list',
  templateUrl: './virtual-server-list.component.html',
})
export class VirtualServerListComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() currentTier: Tier;
  @Input() datacenterId: string;
  @Input() tiers: Tier[] = [];

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
  @ViewChild('defaultPoolTemplate') defaultPoolTemplate: TemplateRef<any>;

  public config: TableConfig<VirtualServerView> = {
    description: 'Virtual Servers in the currently selected Tier',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Type', property: 'type' },
      { name: 'Destination Address', property: 'destinationIpAddress' },
      { name: 'Service Port', property: 'servicePort' },
      { name: 'Pool', property: 'defaultPoolName' },
      { name: 'State', property: 'state' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };
  public virtualServers: VirtualServerView[] = [];
  public isLoading = false;

  private virtualServerChanges: Subscription;

  constructor(
    private entityService: EntityService,
    private virtualServersService: V1LoadBalancerVirtualServersService,
    private ngx: NgxSmartModalService,
  ) {}

  ngOnInit() {
    this.loadVirtualServers();
  }

  ngAfterViewInit() {
    this.virtualServerChanges = this.subscribeToVirtualServerModal();
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.virtualServerChanges]);
  }

  public delete(virtualServer: VirtualServerView): void {
    this.entityService.deleteEntity(virtualServer, {
      entityName: 'Virtual Server',
      delete$: this.virtualServersService.v1LoadBalancerVirtualServersIdDelete({ id: virtualServer.id }),
      softDelete$: this.virtualServersService.v1LoadBalancerVirtualServersIdSoftDelete({ id: virtualServer.id }),
      onSuccess: () => this.loadVirtualServers(),
    });
  }

  public loadVirtualServers(): void {
    this.isLoading = true;
    this.virtualServersService
      .v1LoadBalancerVirtualServersGet({
        join: 'irules,defaultPool',
        filter: `tierId||eq||${this.currentTier.id}`,
      })
      .subscribe(
        virtualServers => {
          this.virtualServers = virtualServers.map(v => {
            return {
              ...v,
              defaultPoolName: v.defaultPool ? v.defaultPool.name : '--',
              state: v.provisionedAt ? 'Provisioned' : 'Not Provisioned',
            };
          });
        },
        () => {
          this.virtualServers = [];
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public import(virtualServers: VirtualServerImportDto[]): void {
    this.virtualServersService
      .v1LoadBalancerVirtualServersBulkImportPost({
        virtualServerImportCollectionDto: { datacenterId: this.datacenterId, virtualServers },
      })
      .subscribe(() => this.loadVirtualServers());
  }

  public openModal(virtualServer?: VirtualServerView): void {
    const dto: VirtualServerModalDto = {
      tierId: this.currentTier.id,
      virtualServer,
    };
    this.ngx.setModalData(dto, 'virtualServerModal');
    this.ngx.getModal('virtualServerModal').open();
  }

  public restore(virtualServer: VirtualServerView): void {
    if (!virtualServer.deletedAt) {
      return;
    }
    this.virtualServersService
      .v1LoadBalancerVirtualServersIdRestorePatch({ id: virtualServer.id })
      .subscribe(() => this.loadVirtualServers());
  }

  private subscribeToVirtualServerModal(): Subscription {
    return this.ngx.getModal('virtualServerModal').onCloseFinished.subscribe(() => {
      this.loadVirtualServers();
      this.ngx.resetModalData('virtualServerModal');
    });
  }
}
