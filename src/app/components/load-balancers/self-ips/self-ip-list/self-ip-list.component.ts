import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import {
  GetManyLoadBalancerSelfIpResponseDto,
  LoadBalancerSelfIp,
  Tier,
  V1LoadBalancerSelfIpsService,
  V1LoadBalancerVlansService,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { combineLatest, Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { EntityService } from 'src/app/services/entity.service';
import { TableContextService } from 'src/app/services/table-context.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { SearchColumnConfig } from '../../../../common/search-bar/search-bar.component';
import { SelfIpModalDto } from '../self-ip-modal/self-ip-modal.dto';
import { FilteredCount } from 'src/app/helptext/help-text-networking';
import { AdvancedSearchAdapter } from 'src/app/common/advanced-search/advanced-search.adapter';

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
  public searchColumns: SearchColumnConfig[] = [
    { displayName: 'IpAddress', propertyName: 'ipAddress', join: ['loadBalancerVlan'] },
    { displayName: 'Vlan', propertyName: 'loadBalancerVlan.name', searchOperator: 'cont', join: ['loadBalancerVlan'] },
  ];

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public config: TableConfig<any> = {
    description: 'Self IPs in the currently selected Tier',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'IP Address', property: 'ipAddress' },
      {
        name: 'VLAN',
        value: (datum: any) => datum?.loadBalancerVlan?.name,
      },
      { name: 'State', property: 'state' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  public vlans;
  public selfIps = {} as GetManyLoadBalancerSelfIpResponseDto;
  public tableComponentDto = new TableComponentDto();
  public perPage = 20;
  public isLoading = false;

  private dataChanges: Subscription;
  private selfIpChanges: Subscription;

  constructor(
    private datacenterContextService: DatacenterContextService,
    private entityService: EntityService,
    private selfIpsService: V1LoadBalancerSelfIpsService,
    private ngx: NgxSmartModalService,
    private tierContextService: TierContextService,
    private tableContextService: TableContextService,
    private vlansService: V1LoadBalancerVlansService,
    public filteredHelpText: FilteredCount,
  ) {
    const advancedSearchAdapterObject = new AdvancedSearchAdapter<LoadBalancerSelfIp>();
    advancedSearchAdapterObject.setService(this.selfIpsService);
    this.config.advancedSearchAdapter = advancedSearchAdapterObject;
  }

  ngOnInit(): void {
    this.dataChanges = this.subscribeToDataChanges();
  }

  ngAfterViewInit(): void {
    this.selfIpChanges = this.subscribeToSelfIpModal();
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.selfIpChanges]);
  }

  public delete(selfIp: SelfIpView): void {
    this.entityService.deleteEntity(selfIp, {
      entityName: 'Self IP',
      delete$: this.selfIpsService.deleteOneLoadBalancerSelfIp({ id: selfIp.id }),
      softDelete$: this.selfIpsService.softDeleteOneLoadBalancerSelfIp({ id: selfIp.id }),
      onSuccess: () => {
        // get search params from local storage
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.tableComponentDto.searchColumn = params.searchColumn;
          this.tableComponentDto.searchText = params.searchText;
          this.loadSelfIps(this.tableComponentDto);
        } else {
          this.loadSelfIps();
        }
      },
    });
  }

  public loadVlans() {
    this.vlansService
      .getManyLoadBalancerVlan({
        filter: [`tierId||eq||${this.currentTier.id}`],
      })
      .subscribe(data => {
        this.vlans = data;
      });
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.loadSelfIps(event);
  }

  public loadSelfIps(event?): void {
    this.isLoading = true;
    let eventParams;
    if (event) {
      this.tableComponentDto.page = event.page ? event.page : 1;
      this.tableComponentDto.perPage = event.perPage ? event.perPage : 20;
      const { searchText } = event;
      this.tableComponentDto.searchText = searchText;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      if (propertyName === 'ipAddress') {
        eventParams = `${propertyName}||eq||${searchText}`;
      } else if (propertyName) {
        eventParams = `${propertyName}||cont||${searchText}`;
      }
    }
    this.selfIpsService
      .getManyLoadBalancerSelfIp({
        filter: [`tierId||eq||${this.currentTier.id}`, eventParams],
        join: ['loadBalancerVlan'],
        page: this.tableComponentDto.page,
        limit: this.tableComponentDto.perPage,
        sort: ['name,ASC'],
      })
      .subscribe(
        response => {
          this.selfIps = response;
          this.selfIps.data = (this.selfIps.data as SelfIpView[]).map((s: LoadBalancerSelfIp) => {
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
          this.selfIps = null;
          this.loadSelfIps();
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
      const { loadBalancerVlanId } = selfIp;
      // continue getting vlanUUID

      const tierId = ObjectUtil.getObjectId(vrfName, this.tiers);
      const vlanId = ObjectUtil.getObjectId(loadBalancerVlanId, this.vlans);
      if (loadBalancerVlanId) {
        selfIp.loadBalancerVlanId = vlanId;
      }
      return {
        ...selfIp,
        tierId,
      };
    });

    this.selfIpsService
      .createManyLoadBalancerSelfIp({
        createManyLoadBalancerSelfIpDto: { bulk },
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
    this.selfIpsService.restoreOneLoadBalancerSelfIp({ id: selfIp.id }).subscribe(() => {
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.tableComponentDto.searchColumn = params.searchColumn;
        this.tableComponentDto.searchText = params.searchText;
        this.loadSelfIps(this.tableComponentDto);
      } else {
        this.loadSelfIps();
      }
    });
  }

  private subscribeToDataChanges(): Subscription {
    const datacenter$ = this.datacenterContextService.currentDatacenter;
    const tier$ = this.tierContextService.currentTier;

    return combineLatest([datacenter$, tier$]).subscribe(data => {
      const [datacenter, tier] = data;
      this.currentTier = tier;
      this.tiers = datacenter.tiers;
      this.loadVlans();
      this.loadSelfIps();
    });
  }

  private subscribeToSelfIpModal(): Subscription {
    return this.ngx.getModal('selfIpModal').onCloseFinished.subscribe(() => {
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.tableComponentDto.searchColumn = params.searchColumn;
        this.tableComponentDto.searchText = params.searchText;
        this.loadSelfIps(this.tableComponentDto);
      } else {
        this.loadSelfIps();
      }
      this.ngx.resetModalData('selfIpModal');
    });
  }
}

export interface ImportSelfIp extends LoadBalancerSelfIp {
  vrfName?: string;
}
