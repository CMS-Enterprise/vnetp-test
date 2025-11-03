import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  TenantConnectivityGraph,
  PathResult,
  Tenant,
  V2AppCentricTenantsService,
  EndpointConnectivityQuery,
} from '../../../../../../../client';
import {
  TenantGraphCoreService,
  TenantGraphQueryService,
  TenantGraphPathTraceService,
  TenantGraphRenderConfig,
} from 'src/app/services/tenant-graph';

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

  // Expansion state for path details
  isControlPathExpanded = false;
  isDataPathExpanded = false;

  // Expansion state for individual hops
  expandedHops = new Map<string, boolean>();

  // Expansion state for evaluation details and generated config
  expandedEvalDetails = new Map<string, boolean>();
  expandedGeneratedConfig = new Map<string, boolean>();

  // Expansion state for nested policy evaluation details and generated config
  expandedNestedPolicyEvalDetails = new Map<string, boolean>();
  expandedNestedPolicyGeneratedConfig = new Map<string, boolean>();

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
      generateConfig: formValue.generateConfig,
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

    // Inject the full PathResult with both control and data paths
    if (result.controlPath || result.dataPath) {
      this.pathTraceService.setExternalPathTraceResult(result);
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
    this.isControlPathExpanded = false;
    this.isDataPathExpanded = false;
    this.expandedHops.clear();
    this.expandedEvalDetails.clear();
    this.expandedGeneratedConfig.clear();
    this.expandedNestedPolicyEvalDetails.clear();
    this.expandedNestedPolicyGeneratedConfig.clear();

    // Clear path trace highlighting
    this.pathTraceService.clearPathTrace();
  }

  // Toggle control path expansion
  toggleControlPath(): void {
    this.isControlPathExpanded = !this.isControlPathExpanded;
  }

  // Toggle data path expansion
  toggleDataPath(): void {
    this.isDataPathExpanded = !this.isDataPathExpanded;
  }

  // Toggle hop expansion
  toggleHop(pathType: 'control' | 'data', hopIndex: number): void {
    const key = `${pathType}-${hopIndex}`;
    this.expandedHops.set(key, !this.expandedHops.get(key));
  }

  // Check if hop is expanded
  isHopExpanded(pathType: 'control' | 'data', hopIndex: number): boolean {
    const key = `${pathType}-${hopIndex}`;
    return this.expandedHops.get(key) ?? false;
  }

  // Toggle evaluation details expansion
  toggleEvalDetails(pathType: 'control' | 'data', hopIndex: number): void {
    const key = `${pathType}-${hopIndex}`;
    this.expandedEvalDetails.set(key, !this.expandedEvalDetails.get(key));
  }

  // Check if evaluation details is expanded
  isEvalDetailsExpanded(pathType: 'control' | 'data', hopIndex: number): boolean {
    const key = `${pathType}-${hopIndex}`;
    return this.expandedEvalDetails.get(key) ?? false;
  }

  // Toggle generated config expansion
  toggleGeneratedConfig(pathType: 'control' | 'data', hopIndex: number): void {
    const key = `${pathType}-${hopIndex}`;
    this.expandedGeneratedConfig.set(key, !this.expandedGeneratedConfig.get(key));
  }

  // Check if generated config is expanded
  isGeneratedConfigExpanded(pathType: 'control' | 'data', hopIndex: number): boolean {
    const key = `${pathType}-${hopIndex}`;
    return this.expandedGeneratedConfig.get(key) ?? false;
  }

  // Toggle nested policy evaluation details expansion
  toggleNestedPolicyEvalDetails(pathType: 'control' | 'data', hopIndex: number, policyPath: string): void {
    const key = `${pathType}-${hopIndex}-${policyPath}`;
    this.expandedNestedPolicyEvalDetails.set(key, !this.expandedNestedPolicyEvalDetails.get(key));
  }

  // Check if nested policy evaluation details is expanded
  isNestedPolicyEvalDetailsExpanded(pathType: 'control' | 'data', hopIndex: number, policyPath: string): boolean {
    const key = `${pathType}-${hopIndex}-${policyPath}`;
    return this.expandedNestedPolicyEvalDetails.get(key) ?? false;
  }

  // Toggle nested policy generated config expansion
  toggleNestedPolicyGeneratedConfig(pathType: 'control' | 'data', hopIndex: number, policyPath: string): void {
    const key = `${pathType}-${hopIndex}-${policyPath}`;
    this.expandedNestedPolicyGeneratedConfig.set(key, !this.expandedNestedPolicyGeneratedConfig.get(key));
  }

  // Check if nested policy generated config is expanded
  isNestedPolicyGeneratedConfigExpanded(pathType: 'control' | 'data', hopIndex: number, policyPath: string): boolean {
    const key = `${pathType}-${hopIndex}-${policyPath}`;
    return this.expandedNestedPolicyGeneratedConfig.get(key) ?? false;
  }

  // Get control plane status display text
  getControlPlaneStatusText(allowed?: boolean): string {
    if (allowed === true) {
      return '✓ Allowed';
    }
    if (allowed === false) {
      return '✗ Denied';
    }
    return 'Unknown';
  }

  // Get control plane metadata status display
  getMetadataStatusText(metadata: any): string {
    if (!metadata) {
      return '';
    }
    return metadata.allowed ? 'Allowed' : 'Denied';
  }

  // Format JSON for display
  formatJson(obj: any): string {
    if (!obj) {
      return '';
    }
    return JSON.stringify(obj, null, 2);
  }
}
