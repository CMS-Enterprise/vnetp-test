import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TenantConnectivityGraph, V2AppCentricTenantsService } from 'client';
import { TenantGraphRenderingService } from 'src/app/services/tenant-graph-rendering.service';

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

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private tenantService: V2AppCentricTenantsService,
    private tenantGraphRenderer: TenantGraphRenderingService,
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
    this.tenantGraphRenderer.contextMenuClick.pipe(takeUntil(this.destroy$)).subscribe(event => {
      console.log('Context menu clicked:', event);
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
      .buildTenantFullGraph({ id: this.tenantId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (graph: TenantConnectivityGraph) => {
          this.graph = graph;
          this.isLoading = false;
          console.log('Tenant graph loaded:', graph);
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
      this.tenantGraphRenderer.renderGraph({
        graph: this.graph,
        containerSelector: '#tenantGraphContainer',
        svgSelector: '#tenantGraphSvg',
        showLegend: true,
        enableOptimization: true,
        enableContextMenu: true,
        defaultEdgeWidth: 1.2,
        hideEdgeTypes: [],
      });
    }, 100);
  }

  public refreshGraph(): void {
    this.loadTenantGraph();
  }
}
