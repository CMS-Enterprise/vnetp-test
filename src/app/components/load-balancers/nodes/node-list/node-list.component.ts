import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { LoadBalancerNode, Tier, V1LoadBalancerNodesService } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { EntityService } from 'src/app/services/entity.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { NodeModalDto } from '../node-modal/node-modal.dto';

interface NodeView extends LoadBalancerNode {
  provisionedState: string;
  autoPopulateView: string;
}

@Component({
  selector: 'app-node-list',
  templateUrl: './node-list.component.html',
})
export class NodeListComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() currentTier: Tier;
  @Input() tiers: Tier[] = [];

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public config: TableConfig<NodeView> = {
    description: 'Nodes in the currently selected Tier',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Type', property: 'type' },
      { name: 'IP Address', property: 'ipAddress' },
      { name: 'FQDN', property: 'fqdn' },
      { name: 'Auto-Populate', property: 'autoPopulateView' },
      { name: 'State', property: 'provisionedState' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };
  public nodes: NodeView[] = [];
  public isLoading = false;

  private nodeChanges: Subscription;

  constructor(private entityService: EntityService, private nodesService: V1LoadBalancerNodesService, private ngx: NgxSmartModalService) {}

  ngOnInit() {
    this.loadNodes();
  }

  ngAfterViewInit() {
    this.nodeChanges = this.subscribeToNodeModal();
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.nodeChanges]);
  }

  public delete(node: NodeView): void {
    this.entityService.deleteEntity(node, {
      entityName: 'Node',
      delete$: this.nodesService.v1LoadBalancerNodesIdDelete({ id: node.id }),
      softDelete$: this.nodesService.v1LoadBalancerNodesIdSoftDelete({ id: node.id }),
      onSuccess: () => this.loadNodes(),
    });
  }

  public loadNodes(): void {
    this.isLoading = true;
    this.nodesService
      .v1LoadBalancerNodesGet({
        filter: `tierId||eq||${this.currentTier.id}`,
      })
      .subscribe(
        nodes => {
          this.nodes = nodes.map(n => {
            const defaultVal = (key: keyof LoadBalancerNode) => {
              const val = n[key];
              return val === null || val === undefined ? '--' : n[key].toString();
            };
            return {
              ...n,
              provisionedState: n.provisionedAt ? 'Provisioned' : 'Not Provisioned',
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
      .v1LoadBalancerNodesBulkPost({
        generatedLoadBalancerNodeBulkDto: { bulk },
      })
      .subscribe(() => this.loadNodes());
  }

  public openModal(node?: NodeView): void {
    const dto: NodeModalDto = {
      tierId: this.currentTier.id,
      node,
    };
    this.ngx.setModalData(dto, 'nodeModal');
    this.ngx.getModal('nodeModal').open();
  }

  public restore(node: NodeView): void {
    if (!node.deletedAt) {
      return;
    }
    this.nodesService.v1LoadBalancerNodesIdRestorePatch({ id: node.id }).subscribe(() => this.loadNodes());
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
