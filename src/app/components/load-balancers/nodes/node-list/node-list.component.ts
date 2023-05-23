import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { GetManyLoadBalancerNodeResponseDto, LoadBalancerNode, Tier, V1LoadBalancerNodesService } from 'client';
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
import { SearchColumnConfig } from '../../../../common/seach-bar/search-bar.component';
import { NodeModalDto } from '../node-modal/node-modal.dto';
import { FilteredCount } from 'src/app/helptext/help-text-networking';

export interface NodeView extends LoadBalancerNode {
  nameView: string;
  state: string;
  autoPopulateView: string;
}

@Component({
  selector: 'app-node-list',
  templateUrl: './node-list.component.html',
})
export class NodeListComponent implements OnInit, OnDestroy, AfterViewInit {
  public currentTier: Tier;
  public tiers: Tier[] = [];
  public searchColumns: SearchColumnConfig[] = [
    { displayName: 'Type', propertyName: 'type' },
    { displayName: 'IpAddress', propertyName: 'ipAddress' },
    { displayName: 'FQDN', propertyName: 'fqdn' },
  ];

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public config: TableConfig<NodeView> = {
    description: 'Nodes in the currently selected Tier',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Type', property: 'type' },
      { name: 'IP Address', property: 'ipAddress' },
      { name: 'FQDN', property: 'fqdn' },
      { name: 'Auto-Populate', property: 'autoPopulateView' },
      { name: 'State', property: 'state' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };
  public nodes = {} as GetManyLoadBalancerNodeResponseDto;
  public tableComponentDto = new TableComponentDto();
  public perPage = 20;
  public isLoading = false;

  private dataChanges: Subscription;
  private nodeChanges: Subscription;

  constructor(
    private datacenterContextService: DatacenterContextService,
    private entityService: EntityService,
    private nodesService: V1LoadBalancerNodesService,
    private ngx: NgxSmartModalService,
    private tierContextService: TierContextService,
    private tableContextService: TableContextService,
    public filteredHelpText: FilteredCount,
  ) {}

  ngOnInit(): void {
    this.dataChanges = this.subscribeToDataChanges();
  }

  ngAfterViewInit(): void {
    this.nodeChanges = this.subscribeToNodeModal();
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.nodeChanges, this.dataChanges]);
  }

  public delete(node: NodeView): void {
    this.entityService.deleteEntity(node, {
      entityName: 'Node',
      delete$: this.nodesService.deleteOneLoadBalancerNode({ id: node.id }),
      softDelete$: this.nodesService.softDeleteOneLoadBalancerNode({ id: node.id }),
      onSuccess: () => {
        // get search params from local storage
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.tableComponentDto.searchColumn = params.searchColumn;
          this.tableComponentDto.searchText = params.searchText;
          this.loadNodes(this.tableComponentDto);
        } else {
          this.loadNodes();
        }
      },
    });
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.loadNodes(event);
  }

  public loadNodes(event?): void {
    this.isLoading = true;
    let eventParams;
    if (event) {
      this.tableComponentDto.page = event.page ? event.page : 1;
      this.tableComponentDto.perPage = event.perPage ? event.perPage : 20;
      const { searchText } = event;
      this.tableComponentDto.searchText = searchText;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      if (propertyName === 'ipAddress' || propertyName === 'type') {
        eventParams = `${propertyName}||eq||${searchText}`;
      } else if (propertyName) {
        eventParams = `${propertyName}||cont||${searchText}`;
      }
    }
    this.nodesService
      .getManyLoadBalancerNode({
        filter: [`tierId||eq||${this.currentTier.id}`, eventParams],
        page: this.tableComponentDto.page,
        limit: this.tableComponentDto.perPage,
        sort: ['name,ASC'],
      })
      .subscribe(
        response => {
          this.nodes = response;
          this.nodes.data = (this.nodes.data as NodeView[]).map(n => {
            const defaultVal = (key: keyof LoadBalancerNode) => {
              const val = n[key];
              return val === null || val === undefined ? '--' : n[key].toString();
            };
            return {
              ...n,
              nameView: n.name.length >= 20 ? n.name.slice(0, 19) + '...' : n.name,
              state: n.provisionedAt ? 'Provisioned' : 'Not Provisioned',
              ipAddress: defaultVal('ipAddress'),
              fqdn: defaultVal('fqdn'),
              autoPopulateView: defaultVal('autoPopulate'),
            };
          });
        },
        () => {
          this.nodes = null;
          this.loadNodes();
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public import(nodes: ImportNode[]): void {
    const bulk = nodes.map(node => {
      const { vrfName } = node;
      if (!vrfName) {
        return node;
      }

      const tierId = ObjectUtil.getObjectId(vrfName, this.tiers);
      return {
        ...node,
        tierId,
      };
    });

    this.nodesService
      .createManyLoadBalancerNode({
        createManyLoadBalancerNodeDto: { bulk },
      })
      .subscribe(() => this.loadNodes());
  }

  public openModal(node?: NodeView): void {
    const dto: NodeModalDto = {
      tierId: this.currentTier.id,
      node,
    };
    this.ngx.setModalData(dto, 'nodeModal');
    this.ngx.open('nodeModal');
  }

  public restore(node: NodeView): void {
    if (!node.deletedAt) {
      return;
    }
    this.nodesService.restoreOneLoadBalancerNode({ id: node.id }).subscribe(() => {
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.tableComponentDto.searchColumn = params.searchColumn;
        this.tableComponentDto.searchText = params.searchText;
        this.loadNodes(this.tableComponentDto);
      } else {
        this.loadNodes();
      }
    });
  }

  private subscribeToDataChanges(): Subscription {
    const datacenter$ = this.datacenterContextService.currentDatacenter;
    const tier$ = this.tierContextService.currentTier;

    return combineLatest([datacenter$, tier$]).subscribe(data => {
      const [datacenter, tier] = data;
      this.tiers = datacenter.tiers;
      this.currentTier = tier;
      this.loadNodes();
    });
  }

  private subscribeToNodeModal(): Subscription {
    return this.ngx.getModal('nodeModal').onCloseFinished.subscribe(() => {
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.tableComponentDto.searchColumn = params.searchColumn;
        this.tableComponentDto.searchText = params.searchText;
        this.loadNodes(this.tableComponentDto);
      } else {
        this.loadNodes();
      }
      this.ngx.resetModalData('nodeModal');
    });
  }
}

export interface ImportNode extends LoadBalancerNode {
  vrfName?: string;
}
