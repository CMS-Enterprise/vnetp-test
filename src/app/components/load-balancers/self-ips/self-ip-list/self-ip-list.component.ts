import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { LoadBalancerSelfIp, Tier, V1LoadBalancerSelfIpsService } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { combineLatest, Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { EntityService } from 'src/app/services/entity.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { SelfIpModalDto } from '../self-ip-modal/self-ip-modal.dto';

export interface SelfIpView extends LoadBalancerSelfIp {
  nameView: string;
  state: string;
  vlanName: string;
}

@Component({
  selector: 'app-self-ip-list',
  templateUrl: './self-ip-list.component.html',
})
export class SelfIpListComponent implements OnInit, OnDestroy, AfterViewInit {
  public currentTier: Tier;
  public tiers: Tier[] = [];

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public config: TableConfig<SelfIpView> = {
    description: 'Self IPs in the currently selected Tier',
    columns: [
      { name: 'Name', property: 'nameView' },
      { name: 'IP Address', property: 'ipAddress' },
      { name: 'VLAN', property: 'vlanName' },
      { name: 'State', property: 'state' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };
  public selfIps: SelfIpView[] = [];
  public isLoading = false;

  private dataChanges: Subscription;
  private selfIpChanges: Subscription;

  constructor(
    private datacenterContextService: DatacenterContextService,
    private entityService: EntityService,
    private selfIpsService: V1LoadBalancerSelfIpsService,
    private ngx: NgxSmartModalService,
    private tierContextService: TierContextService,
  ) {}

  ngOnInit() {
    this.dataChanges = this.subscribeToDataChanges();
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
              nameView: s.name.length >= 20 ? s.name.slice(0, 19) + '...' : s.name,
              state: s.provisionedAt ? 'Provisioned' : 'Not Provisioned',
              vlanName: loadBalancerVlan
                ? loadBalancerVlan.name.length >= 20
                  ? loadBalancerVlan.name.slice(0, 19) + '...'
                  : loadBalancerVlan.name
                : undefined,
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
    this.ngx.open('selfIpModal');
  }

  public restore(selfIp: SelfIpView): void {
    if (!selfIp.deletedAt) {
      return;
    }
    this.selfIpsService.v1LoadBalancerSelfIpsIdRestorePatch({ id: selfIp.id }).subscribe(() => this.loadSelfIps());
  }

  private subscribeToDataChanges(): Subscription {
    const datacenter$ = this.datacenterContextService.currentDatacenter;
    const tier$ = this.tierContextService.currentTier;

    return combineLatest([datacenter$, tier$]).subscribe(data => {
      const [datacenter, tier] = data;
      this.currentTier = tier;
      this.tiers = datacenter.tiers;
      this.loadSelfIps();
    });
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
