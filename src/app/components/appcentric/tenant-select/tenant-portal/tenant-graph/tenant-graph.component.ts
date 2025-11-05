import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TenantConnectivityGraph, V2AppCentricTenantsService } from 'client';
import { TenantGraphCoreService, TenantGraphRenderConfig, PathTraceState, ContextMenuClickEvent } from 'src/app/services/tenant-graph';
import { TenantPortalNavigationService } from '../../../../../services/tenant-portal-navigation.service';

@Component({
  selector: 'app-tenant-graph',
  templateUrl: './tenant-graph.component.html',
  styleUrls: ['./tenant-graph.component.scss'],
})
export class TenantGraphComponent implements OnInit, OnDestroy {
  public graph: TenantConnectivityGraph | null = null;
  public isLoading = false;
  public error: string | null = null;
  public tenantId: string | null = null;
  public pathTraceState: PathTraceState = {
    selectedNodes: [],
    pathExists: false,
    highlightedPath: undefined,
    pathTraceData: undefined,
    showPathOnly: false,
  };

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private tenantService: V2AppCentricTenantsService,
    private tenantGraphCore: TenantGraphCoreService,
    private tenantPortalNavigation: TenantPortalNavigationService,
  ) {}

  ngOnInit(): void {
    // Get tenant ID from parent route parameters
    this.route.parent?.parent?.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.tenantId = params.get('id');
      if (this.tenantId) {
        this.loadTenantGraph();
      }
    });

    // Subscribe to context menu clicks
    this.tenantGraphCore.contextMenuClick.pipe(takeUntil(this.destroy$)).subscribe(event => {
      console.log('Context menu clicked:', event);
      this.handleContextMenuClick(event);
    });

    // Subscribe to path trace state changes
    this.tenantGraphCore.pathTraceStateChange.pipe(takeUntil(this.destroy$)).subscribe(state => {
      this.pathTraceState = state;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTenantGraph(): void {
    if (!this.tenantId) {
      this.error = 'No tenant ID available';
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.tenantService
      .buildTenantFullGraphTenant({ id: this.tenantId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (graph: TenantConnectivityGraph) => {
          this.graph = graph;
          this.isLoading = false;
          // Small delay to ensure DOM is ready
          setTimeout(() => this.renderGraph(), 100);
        },
        error: (err: any) => {
          console.error('Failed to load tenant graph:', err);
          this.error = err?.message || 'Failed to load tenant graph';
          this.isLoading = false;
        },
      });
  }

  private renderGraph(): void {
    if (!this.graph) {
      return;
    }

    // Use setTimeout to ensure DOM elements are rendered
    setTimeout(() => {
      const config: TenantGraphRenderConfig = {
        graph: this.graph,
        containerSelector: '#tenantGraphContainer',
        svgSelector: '#tenantGraphSvg',
        hideEdgeTypes: ['TENANT_CONTAINS_FIREWALL', 'INTERVRF_CONNECTION'],
        showLegend: true,
        enableOptimization: true,
        enableContextMenu: true,
        enablePathTrace: true,
        defaultEdgeWidth: 1.2,
        contextMenuConfig: {
          EXTERNAL_FIREWALL: [
            {
              type: 'item',
              name: 'Edit Firewall Config',
              identifier: 'edit-firewall',
              enabled: true,
            },
          ],
        },
      };
      this.tenantGraphCore.renderGraph(config);
    }, 100);
  }

  public refreshGraph(): void {
    this.loadTenantGraph();
  }
  public handleContextMenuClick(event: ContextMenuClickEvent): void {
    if (event.nodeType === 'EXTERNAL_FIREWALL' || event.nodeType === 'SERVICE_GRAPH_FIREWALL') {
      if (event.menuItemIdentifier === 'edit-firewall') {
        this.tenantPortalNavigation.navigateToFirewallConfig(
          {
            type: event.nodeType === 'EXTERNAL_FIREWALL' ? 'external-firewall' : 'service-graph-firewall',
            firewallId: event.node.id,
            firewallName: event.node.name,
          },
          this.route,
        );
      }
    }
  }
}
