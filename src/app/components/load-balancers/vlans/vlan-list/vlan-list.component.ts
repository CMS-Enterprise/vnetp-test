import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { GetManyLoadBalancerVlanResponseDto, GetManyVlanResponseDto, LoadBalancerVlan, Tier, V1LoadBalancerVlansService } from 'client';
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
import { VlanModalDto } from '../vlan-modal/vlan-modal.dto';
import { FilteredCount } from 'src/app/helptext/help-text-networking';
import { AdvancedSearchAdapter } from 'src/app/common/advanced-search/advanced-search.adapter';

export interface VlanView extends LoadBalancerVlan {
  nameView: string;
  state: string;
}

@Component({
  selector: 'app-vlan-list',
  templateUrl: './vlan-list.component.html',
})
export class VlanListComponent implements OnInit, OnDestroy, AfterViewInit {
  public currentTier: Tier;
  public tiers: Tier[] = [];
  public searchColumns: SearchColumnConfig[] = [{ displayName: 'Tag', propertyName: 'tag' }];

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
  public vlans = {} as GetManyLoadBalancerVlanResponseDto;
  public tableComponentDto = new TableComponentDto();
  public perPage = 20;
  public isLoading = false;

  private dataChanges: Subscription;
  private vlanChanges: Subscription;

  constructor(
    private datacenterContextService: DatacenterContextService,
    private entityService: EntityService,
    private vlansService: V1LoadBalancerVlansService,
    private ngx: NgxSmartModalService,
    private tierContextService: TierContextService,
    private tableContextService: TableContextService,
    public filteredHelpText: FilteredCount,
  ) {
    const advancedSearchAdapterObject = new AdvancedSearchAdapter<LoadBalancerVlan>();
    advancedSearchAdapterObject.setService(this.vlansService);
    this.config.advancedSearchAdapter = advancedSearchAdapterObject;
  }

  ngOnInit(): void {
    this.dataChanges = this.subscribeToDataChanges();
  }

  ngAfterViewInit(): void {
    this.vlanChanges = this.subscribeToVlanModal();
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.vlanChanges, this.dataChanges]);
  }

  public delete(vlan: VlanView): void {
    this.entityService.deleteEntity(vlan, {
      entityName: 'VLAN',
      delete$: this.vlansService.deleteOneLoadBalancerVlan({ id: vlan.id }),
      softDelete$: this.vlansService.softDeleteOneLoadBalancerVlan({ id: vlan.id }),
      onSuccess: () => {
        // get search params from local storage
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.tableComponentDto.searchColumn = params.searchColumn;
          this.tableComponentDto.searchText = params.searchText;
          this.loadVlans(this.tableComponentDto);
        } else {
          this.loadVlans();
        }
      },
    });
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.loadVlans(event);
  }

  public loadVlans(event?): void {
    this.isLoading = true;
    let eventParams;
    if (event) {
      this.tableComponentDto.page = event.page ? event.page : 1;
      this.tableComponentDto.perPage = event.perPage ? event.perPage : 20;
      const { searchText } = event;
      this.tableComponentDto.searchText = searchText;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      if (propertyName === 'tag') {
        eventParams = `${propertyName}||eq||${searchText}`;
      } else if (propertyName) {
        eventParams = `${propertyName}||cont||${searchText}`;
      }
    }
    this.vlansService
      .getManyLoadBalancerVlan({
        filter: [`tierId||eq||${this.currentTier.id}`, eventParams],
        page: this.tableComponentDto.page,
        limit: this.tableComponentDto.perPage,
        sort: ['name,ASC'],
      })
      .subscribe(
        response => {
          this.vlans = response;
          this.vlans.data = (this.vlans.data as VlanView[]).map(v => {
            return {
              ...v,
              nameView: v.name.length >= 20 ? v.name.slice(0, 19) + '...' : v.name,
              state: v.provisionedAt ? 'Provisioned' : 'Not Provisioned',
            };
          });
        },
        () => {
          this.vlans = null;
          this.loadVlans();
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public import(vlans: ImportVlan[]): void {
    const bulk = vlans.map(vlan => {
      // this becomes unnecessary with the PapaParse dynamicTyping property
      if (vlan.tag && typeof vlan.tag !== 'number') {
        vlan.tag = +vlan.tag;
      }
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
      .createManyLoadBalancerVlan({
        createManyLoadBalancerVlanDto: { bulk },
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
    this.vlansService.restoreOneLoadBalancerVlan({ id: vlan.id }).subscribe(() => {
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.tableComponentDto.searchColumn = params.searchColumn;
        this.tableComponentDto.searchText = params.searchText;
        this.loadVlans(this.tableComponentDto);
      } else {
        this.loadVlans();
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
    });
  }

  private subscribeToVlanModal(): Subscription {
    return this.ngx.getModal('vlanModal').onCloseFinished.subscribe(() => {
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.tableComponentDto.searchColumn = params.searchColumn;
        this.tableComponentDto.searchText = params.searchText;
        this.loadVlans(this.tableComponentDto);
      } else {
        this.loadVlans();
      }
      this.ngx.resetModalData('vlanModal');
    });
  }
}

export interface ImportVlan extends LoadBalancerVlan {
  vrfName?: string;
}
