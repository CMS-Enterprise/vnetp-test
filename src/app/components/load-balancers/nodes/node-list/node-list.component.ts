import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { LoadBalancerNode, Tier, V1LoadBalancerNodesService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { combineLatest, Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { EntityService } from 'src/app/services/entity.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { NodeModalDto } from '../node-modal/node-modal.dto';

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

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public config: TableConfig<NodeView> = {
    description: 'Nodes in the currently selected Tier',
    columns: [
      { name: 'Name', property: 'nameView' },
      { name: 'Type', property: 'type' },
      { name: 'IP Address', property: 'ipAddress' },
      { name: 'FQDN', property: 'fqdn' },
      { name: 'Auto-Populate', property: 'autoPopulateView' },
      { name: 'State', property: 'state' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };
  public nodes: NodeView[] = [];
  public isLoading = false;

  private dataChanges: Subscription;
  private nodeChanges: Subscription;

  constructor(
    private datacenterContextService: DatacenterContextService,
    private entityService: EntityService,
    private nodesService: V1LoadBalancerNodesService,
    private ngx: NgxSmartModalService,
    private tierContextService: TierContextService,
  ) {}

  ngOnInit() {
    this.dataChanges = this.subscribeToDataChanges();
  }

  ngAfterViewInit() {
    this.nodeChanges = this.subscribeToNodeModal();
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.nodeChanges, this.dataChanges]);
  }

  public delete(node: NodeView): void {
    this.entityService.deleteEntity(node, {
      entityName: 'Node',
      delete$: this.nodesService.deleteOneLoadBalancerNode({ id: node.id }),
      softDelete$: this.nodesService.softDeleteOneLoadBalancerNode({ id: node.id }),
      onSuccess: () => this.loadNodes(),
    });
  }

  public loadNodes(): void {
    this.isLoading = true;
    this.nodesService
      .getManyLoadBalancerNode({
        filter: [`tierId||eq||${this.currentTier.id}`],
      })
      .subscribe(
        (nodes: unknown) => {
          this.nodes = (nodes as NodeView[]).map(n => {
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
          this.nodes = [];
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
    this.nodesService.restoreOneLoadBalancerNode({ id: node.id }).subscribe(() => this.loadNodes());
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
      this.loadNodes();
      this.ngx.resetModalData('nodeModal');
    });
  }
}

export interface ImportNode extends LoadBalancerNode {
  vrfName?: string;
}
