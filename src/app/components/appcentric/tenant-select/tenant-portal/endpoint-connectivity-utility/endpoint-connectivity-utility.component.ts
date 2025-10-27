import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TenantConnectivityGraph, PathResult, Tenant, V2AppCentricTenantsService, EndpointConnectivityQuery } from '../../../../../../../client';
import { TenantGraphCoreService, TenantGraphQueryService, TenantGraphPathTraceService, TenantGraphRenderConfig } from 'src/app/services/tenant-graph';

@Component({
  selector: 'app-endpoint-connectivity-utility',
  templateUrl: './endpoint-connectivity-utility.component.html',
  styleUrls: ['./endpoint-connectivity-utility.component.scss'],
})
export class EndpointConnectivityUtilityComponent implements OnInit, OnDestroy {
  // Form controls
  connectivityForm: FormGroup;

  // State management
  isLoading = false;
  error: string | null = null;
  tenantId: string;
  tenantVersion: number;

  // Graph state
  graph: TenantConnectivityGraph | null = null;
  isGraphLoading = false;
  graphError: string | null = null;

  // API response data
  connectivityResult: PathResult | null = null;

  // Protocol options for the form
  protocolOptions = ['tcp', 'udp', 'icmp'];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private queryService: TenantGraphQueryService,
    private router: Router,
    private tenantService: V2AppCentricTenantsService,
    private tenantGraphCore: TenantGraphCoreService,
    private pathTraceService: TenantGraphPathTraceService,
  ) {}

  ngOnInit(): void {
    // Extract tenant ID from the URL
    const match = this.router.routerState.snapshot.url.match(
      /tenant-select\/edit\/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}/,
    );
    if (match) {
      this.tenantId = match[0].split('/')[2];
      this.tenantService
        .getOneTenant({ id: this.tenantId })
        .pipe(takeUntil(this.destroy$))
        .subscribe((tenant: Tenant) => {
          this.tenantVersion = tenant.version;
          // Load graph after we have tenant version
          this.loadTenantGraph();
        });
    }

    this.connectivityForm = this.fb.group({
      generatedConfigIdentifier: ['connectivity-test-' + Date.now(), Validators.required],
      sourceEndpointIp: ['', [Validators.required, Validators.pattern('^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$')]],
      sourceEndpointPort: [null],
      destinationEndpointIp: ['', [Validators.required, Validators.pattern('^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$')]],
      destinationEndpointPort: ['', [Validators.pattern('^\\d+$')]],
      ipProtocol: ['tcp', Validators.required],
      bypassServiceGraph: [true],
      generateConfig: [false],
      bidirectional: [false],
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTenantGraph(): void {
    if (!this.tenantId) {
      this.graphError = 'No tenant ID available';
      return;
    }

    this.isGraphLoading = true;
    this.graphError = null;

    this.tenantService
      .buildTenantFullGraphTenant({ id: this.tenantId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (graph: TenantConnectivityGraph) => {
          this.graph = graph;
          this.isGraphLoading = false;
          console.log('Tenant graph loaded for connectivity utility:', graph);
          // Render graph after short delay to ensure DOM is ready
          setTimeout(() => this.renderGraph(), 100);
        },
        error: (err: any) => {
          console.error('Failed to load tenant graph:', err);
          this.graphError = err?.message || 'Failed to load tenant graph';
          this.isGraphLoading = false;
        },
      });
  }

  private renderGraph(): void {
    if (!this.graph) {
      return;
    }

    const config: TenantGraphRenderConfig = {
      graph: this.graph,
      containerSelector: '#endpointGraphContainer',
      svgSelector: '#endpointGraphSvg',
      showLegend: true,
      enableOptimization: true,
      enableContextMenu: false, // No context menu needed
      enablePathTrace: false, // No interactive path trace
      defaultEdgeWidth: 1.2,
    };

    this.tenantGraphCore.renderGraph(config);
  }

  // Submit form to test connectivity
  onSubmit(): void {
    if (this.connectivityForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    const formValue = this.connectivityForm.value;

    // Prepare the query object for the API
    const query: EndpointConnectivityQuery = {
      generatedConfigIdentifier: formValue.generatedConfigIdentifier,
      sourceEndpointIp: formValue.sourceEndpointIp,
      sourceEndpointPort: formValue.sourceEndpointPort ? Number(formValue.sourceEndpointPort) : null,
      destinationEndpointIp: formValue.destinationEndpointIp,
      destinationEndpointPort: formValue.destinationEndpointPort ? Number(formValue.destinationEndpointPort) : null,
      ipProtocol: formValue.ipProtocol,
      bypassServiceGraph: formValue.bypassServiceGraph,
      generateConfig: formValue.generateConfig,
      bidirectional: formValue.bidirectional,
      tenantId: this.tenantId,
      tenantVersion: this.tenantVersion,
    };

    // Use query service to execute connectivity test
    this.queryService
      .checkIpConnectivity(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: PathResult) => {
          this.isLoading = false;
          this.connectivityResult = result;
          console.log('Connectivity result:', result);

          // Inject path trace into graph
          this.injectPathTraceResult(result);
        },
        error: err => {
          this.isLoading = false;
          this.error = err.message || 'An error occurred while testing connectivity';
        },
      });
  }

  private injectPathTraceResult(result: PathResult): void {
    if (!result) {
      return;
    }

    // Clear any existing path trace
    this.pathTraceService.clearPathTrace();

    // Inject control path by default (contains policy validation)
    if (result.controlPath?.pathTraceData) {
      this.pathTraceService.setExternalPathTraceData(result.controlPath.pathTraceData);

      // Also set both control and data paths for comprehensive view
      if (result.controlPath && result.dataPath) {
        // The service already has methods to handle this through setExternalPathTraceData
        // which sets up the highlighting properly
      }
    }
  }

  // Reset the form
  resetForm(): void {
    this.connectivityForm.reset({
      generatedConfigIdentifier: 'connectivity-test-' + Date.now(),
      ipProtocol: 'tcp',
      bypassServiceGraph: true,
      generateConfig: false,
      bidirectional: false,
    });
    this.connectivityResult = null;
    this.error = null;

    // Clear path trace highlighting
    this.pathTraceService.clearPathTrace();
  }
}
