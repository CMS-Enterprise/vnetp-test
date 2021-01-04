import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { LoadBalancerVlan, Tier, V1LoadBalancerVlansService } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { combineLatest, Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { EntityService } from 'src/app/services/entity.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { VlanModalDto } from '../vlan-modal/vlan-modal.dto';

export interface VlanView extends LoadBalancerVlan {
  state: string;
}

@Component({
  selector: 'app-vlan-list',
  templateUrl: './vlan-list.component.html',
})
export class VlanListComponent implements OnInit, OnDestroy, AfterViewInit {
  public currentTier: Tier;
  public tiers: Tier[] = [];

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public config: TableConfig<VlanView> = {
    description: 'VLANs in the currently selected Tier',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Tag', property: 'tag' },
      { name: 'State', property: 'state' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };
  public vlans: VlanView[] = [];
  public isLoading = false;

  private dataChanges: Subscription;
  private vlanChanges: Subscription;

  constructor(
    private datacenterContextService: DatacenterContextService,
    private entityService: EntityService,
    private vlansService: V1LoadBalancerVlansService,
    private ngx: NgxSmartModalService,
    private tierContextService: TierContextService,
  ) {}

  ngOnInit() {
    this.dataChanges = this.subscribeToDataChanges();
  }

  ngAfterViewInit() {
    this.vlanChanges = this.subscribeToVlanModal();
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.vlanChanges, this.dataChanges]);
  }

  public delete(vlan: VlanView): void {
    this.entityService.deleteEntity(vlan, {
      entityName: 'VLAN',
      delete$: this.vlansService.v1LoadBalancerVlansIdDelete({ id: vlan.id }),
      softDelete$: this.vlansService.v1LoadBalancerVlansIdSoftDelete({ id: vlan.id }),
      onSuccess: () => this.loadVlans(),
    });
  }

  public loadVlans(): void {
    this.isLoading = true;
    this.vlansService
      .v1LoadBalancerVlansGet({
        filter: `tierId||eq||${this.currentTier.id}`,
      })
      .subscribe(
        vlans => {
          this.vlans = vlans.map(v => {
            return {
              ...v,
              state: v.provisionedAt ? 'Provisioned' : 'Not Provisioned',
            };
          });
        },
        () => {
          this.vlans = [];
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public import(vlans: ImportVlan[]): void {
    const bulk = vlans.map(vlan => {
      const { vrfName } = vlan;
      if (!vrfName) {
        return vlan;
      }

      const tierId = ObjectUtil.getObjectId(vrfName, this.tiers);
      return {
        ...vlan,
        tierId,
      };
    });

    this.vlansService
      .v1LoadBalancerVlansBulkPost({
        generatedLoadBalancerVlanBulkDto: { bulk },
      })
      .subscribe(() => this.loadVlans());
  }

  public openModal(vlan?: VlanView): void {
    const dto: VlanModalDto = {
      tierId: this.currentTier.id,
      vlan,
    };
    this.ngx.setModalData(dto, 'vlanModal');
    this.ngx.open('vlanModal');
  }

  public restore(vlan: VlanView): void {
    if (!vlan.deletedAt) {
      return;
    }
    this.vlansService.v1LoadBalancerVlansIdRestorePatch({ id: vlan.id }).subscribe(() => this.loadVlans());
  }

  private subscribeToDataChanges(): Subscription {
    const datacenter$ = this.datacenterContextService.currentDatacenter;
    const tier$ = this.tierContextService.currentTier;

    return combineLatest([datacenter$, tier$]).subscribe(data => {
      const [datacenter, tier] = data;
      this.currentTier = tier;
      this.tiers = datacenter.tiers;
      this.loadVlans();
    });
  }

  private subscribeToVlanModal(): Subscription {
    return this.ngx.getModal('vlanModal').onCloseFinished.subscribe(() => {
      this.loadVlans();
      this.ngx.resetModalData('vlanModal');
    });
  }
}

export interface ImportVlan extends LoadBalancerVlan {
  vrfName?: string;
}
