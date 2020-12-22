import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { LoadBalancerSelfIp, Tier, V1LoadBalancerSelfIpsService } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { EntityService } from 'src/app/services/entity.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { SelfIpModalDto } from '../self-ip-modal/self-ip-modal.dto';

interface SelfIpView extends LoadBalancerSelfIp {
  provisionedState: string;
  vlanName: string;
}

@Component({
  selector: 'app-self-ip-list',
  templateUrl: './self-ip-list.component.html',
})
export class SelfIpListComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() currentTier: Tier;
  @Input() tiers: Tier[] = [];

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public config: TableConfig<SelfIpView> = {
    description: 'Self IPs in the currently selected Tier',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'IP Address', property: 'ipAddress' },
      { name: 'VLAN', property: 'vlanName' },
      { name: 'State', property: 'provisionedState' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };
  public selfIps: SelfIpView[] = [];
  public isLoading = false;

  private selfIpChanges: Subscription;

  constructor(
    private entityService: EntityService,
    private selfIpsService: V1LoadBalancerSelfIpsService,
    private ngx: NgxSmartModalService,
  ) {}

  ngOnInit() {
    this.loadSelfIps();
  }

  ngAfterViewInit() {
    this.selfIpChanges = this.subscribeToSelfIpModal();
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.selfIpChanges]);
  }

  public delete(selfIp: SelfIpView): void {
    this.entityService.deleteEntity(selfIp, {
      entityName: 'Self IP',
      delete$: this.selfIpsService.v1LoadBalancerSelfIpsIdDelete({ id: selfIp.id }),
      softDelete$: this.selfIpsService.v1LoadBalancerSelfIpsIdSoftDelete({ id: selfIp.id }),
      onSuccess: () => this.loadSelfIps(),
    });
  }

  public loadSelfIps(): void {
    this.isLoading = true;
    this.selfIpsService
      .v1LoadBalancerSelfIpsGet({
        filter: `tierId||eq||${this.currentTier.id}`,
        join: 'loadBalancerVlan',
      })
      .subscribe(
        selfIps => {
          this.selfIps = selfIps.map((s: LoadBalancerSelfIp) => {
            // TODO: Fix back-end generated type
            const loadBalancerVlan = (s as any).loadBalancerVlan as { name: string };
            return {
              ...s,
              provisionedState: s.provisionedAt ? 'Provisioned' : 'Not Provisioned',
              vlanName: loadBalancerVlan ? loadBalancerVlan.name : '--',
            };
          });
        },
        () => {
          this.selfIps = [];
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public import(selfIps: ImportSelfIp[]): void {
    const bulk = selfIps.map(selfIp => {
      const { vrfName } = selfIp;
      if (!vrfName) {
        return selfIp;
      }

      const tierId = ObjectUtil.getObjectId(vrfName, this.tiers);
      return {
        ...selfIp,
        tierId,
      };
    });

    this.selfIpsService
      .v1LoadBalancerSelfIpsBulkPost({
        generatedLoadBalancerSelfIpBulkDto: { bulk },
      })
      .subscribe(() => this.loadSelfIps());
  }

  public openModal(selfIp?: SelfIpView): void {
    const dto: SelfIpModalDto = {
      tierId: this.currentTier.id,
      selfIp,
    };
    this.ngx.setModalData(dto, 'selfIpModal');
    this.ngx.getModal('selfIpModal').open();
  }

  public restore(selfIp: SelfIpView): void {
    if (!selfIp.deletedAt) {
      return;
    }
    this.selfIpsService.v1LoadBalancerSelfIpsIdRestorePatch({ id: selfIp.id }).subscribe(() => this.loadSelfIps());
  }

  private subscribeToSelfIpModal(): Subscription {
    return this.ngx.getModal('selfIpModal').onCloseFinished.subscribe(() => {
      this.loadSelfIps();
      this.ngx.resetModalData('selfIpModal');
    });
  }
}

export interface ImportSelfIp extends LoadBalancerSelfIp {
  vrfName?: string;
}
