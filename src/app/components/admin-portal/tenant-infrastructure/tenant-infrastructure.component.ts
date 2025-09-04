import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  V2AdminTenantOrchestratorService,
  TenantInfrastructureConfigDto,
  TenantInfrastructureValidationResponse,
  ExternalVrfConnectionExternalVrfEnum,
  TenantConnectivityGraph,
  TenantInfrastructureResponse,
} from 'client';
import * as yaml from 'js-yaml';
import { Subject, debounceTime } from 'rxjs';
import { TenantGraphRenderingService } from '../../../services/tenant-graph-rendering.service';

@Component({
  selector: 'app-tenant-infrastructure',
  templateUrl: './tenant-infrastructure.component.html',
  styleUrls: ['./tenant-infrastructure.component.scss'],
})
export class TenantInfrastructureComponent implements OnInit, OnDestroy {
  graph: TenantConnectivityGraph | null = null;
  mode: 'create' | 'edit' = 'create';
  tenantId?: string;
  private sub?: Subscription;

  rawJson = '';
  parseError: string | null = null;
  parsedConfig: TenantInfrastructureConfigDto | null = null;
  config: TenantInfrastructureConfigDto;
  validation: TenantInfrastructureValidationResponse | null = null;
  saveResponse: TenantInfrastructureResponse | null = null;
  validationErrors: Map<string, string> = new Map(); // path -> error message
  isSubmitting = false;
  isLoadingConfig = false;
  hasValidated = false;
  activeTab: 'tenant' | 'firewalls' | 'vrfs' = 'tenant';
  selectedFirewallIdx = 0;
  selectedVrfIdx = 0;
  externalVrfOptions = Object.values(ExternalVrfConnectionExternalVrfEnum);
  previewFormat: 'json' | 'yaml' = 'json';
  rightPanelView: 'config' | 'graph' | 'response' = 'config';
  private graphUpdateSubject = new Subject<void>();
  private graphUpdateSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orchestrator: V2AdminTenantOrchestratorService,
    private tenantGraphRenderer: TenantGraphRenderingService,
  ) {}

  ngOnInit(): void {
    // id comes from the parent route (admin portal child route: edit/:id)
    this.sub =
      this.route.parent?.paramMap.subscribe(params => {
        const id = params.get('id');
        this.tenantId = id || undefined;
        this.mode = id ? 'edit' : 'create';
      }) || undefined;

    // Seed example JSON/config
    if (this.mode === 'create') {
      this.config = {
        tenant: {
          name: 'tenant1',
          environmentId: '789725fa-eb42-45fa-a81b-25eed5102a3e', // TODO: Placeholder, need to lookup from API.
          alias: 'Tenant 1',
          description: '',
        },
        externalFirewalls: [
          {
            name: 'fw1',
            firewallDeviceType: 'PaloAlto',
            vsysName: 'vsys1',
            bgpAsn: null,
            bgpAsnAutoGenerate: true,
            externalVrfConnections: [] as any[],
          },
        ],
        vrfs: [
          {
            name: 'default_vrf',
            alias: 'Default VRF',
            maxExternalRoutes: 150,
            bgpAsn: null,
            bgpAsnAutoGenerate: true,
            serviceGraphs: [
              {
                name: 'sg1',
                serviceGraphFirewall: {
                  name: 'sg1-fw',
                  firewallDeviceType: 'PaloAlto',
                  vsysName: 'vsys1',
                },
              },
            ] as any[],
            l3outs: [{ name: 'l3out1', l3outType: 'external', externalFirewall: 'fw1' }] as any[],
          },
        ],
      } as TenantInfrastructureConfigDto;
    } else if (this.mode === 'edit' && this.tenantId) {
      this.loadExistingConfig();
    }

    if (this.mode === 'create') {
      this.updateRawFromConfig();
    }

    let debounceTimeMs = 1000;

    if (this.mode === 'edit') {
      debounceTimeMs = 0;
      this.generateGraphInternal();
    }

    // Setup debounced graph updates
    this.graphUpdateSubscription = this.graphUpdateSubject.pipe(debounceTime(debounceTimeMs)).subscribe(() => {
      if (this.rightPanelView === 'graph') {
        this.generateGraphInternal();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.graphUpdateSubscription?.unsubscribe();
  }

  goBack(): void {
    this.router.navigate(['/adminportal/tenant-v2'], { queryParamsHandling: 'merge' });
  }

  onTextChange(): void {
    this.validation = null;
    try {
      let obj: any;
      if (this.previewFormat === 'json') {
        obj = JSON.parse(this.rawJson);
      } else {
        obj = yaml.load(this.rawJson);
      }
      this.parsedConfig = obj as TenantInfrastructureConfigDto;
      this.config = this.parsedConfig;
      // Ensure arrays exist
      this.config.externalFirewalls = this.config.externalFirewalls || [];
      this.config.vrfs = this.config.vrfs || [];
      this.parseError = null;
      // Clamp selections
      if (this.selectedFirewallIdx >= this.config.externalFirewalls.length) {
        this.selectedFirewallIdx = 0;
      }
      if (this.selectedVrfIdx >= this.config.vrfs.length) {
        this.selectedVrfIdx = 0;
      }
    } catch (e: any) {
      this.parsedConfig = null;
      this.parseError = e?.message || `Invalid ${this.previewFormat.toUpperCase()}`;
    }
  }

  validate(): void {
    this.isSubmitting = true;
    this.validation = null;
    this.validationErrors.clear();

    this.orchestrator.validateTenantInfrastructure({ tenantInfrastructureConfigDto: this.config }).subscribe({
      next: res => {
        this.validation = res as TenantInfrastructureValidationResponse;
        this.hasValidated = true;
        this.showConfig();
      },
      error: err => {
        console.log('Validation error response:', err);
        this.hasValidated = false;

        // Parse class-validator errors from API response
        if (err?.error?.detail?.message && Array.isArray(err.error.detail.message)) {
          err.error.detail.message.forEach((msg: string) => {
            this.parseValidationError(msg);
          });
        }

        // Also create a general validation response for the UI
        this.validation = {
          success: false,
          errors: err?.error?.detail?.message?.map((msg: string) => ({
            path: '$',
            message: msg,
          })) || [{ path: '$', message: err?.message || 'Request failed' }],
        } as TenantInfrastructureValidationResponse;
      },
      complete: () => (this.isSubmitting = false),
    });
  }

  private parseValidationError(message: string): void {
    // Parse messages like "externalFirewalls.0.bgpAsn must be provided if bgpAsnAutoGenerate is not true"
    // Extract the path part before the first space
    const pathMatch = message.match(/^([a-zA-Z0-9.\[\]]+)/);
    if (pathMatch) {
      const path = pathMatch[1];
      this.validationErrors.set(path, message);
      console.log('Parsed validation error:', { path, message }); // Debug
    }
  }

  getFieldError(path: string): string | null {
    return this.validationErrors.get(path) || null;
  }

  hasFieldError(path: string): boolean {
    const hasError = this.validationErrors.has(path);
    if (hasError) {
      console.log('Field has error:', { path, message: this.validationErrors.get(path) }); // Debug
    }
    return hasError;
  }

  getGraph(): void {
    if (this.isSubmitting) {
      return;
    }
    this.rightPanelView = 'graph';
    this.graphUpdateSubject.next();
  }

  private generateGraphInternal(): void {
    if (this.mode === 'create') {
      this.orchestrator.buildTenantInfrastructureGraph({ tenantInfrastructureConfigDto: this.config }).subscribe({
        next: res => {
          this.graph = res as TenantConnectivityGraph;
          setTimeout(() => this.renderGraph(), 100);
        },
        error: err => {
          console.error(err);
        },
      });
    } else if (this.mode === 'edit') {
      this.orchestrator.getTenantInfrastructureGraph({ id: this.tenantId }).subscribe({
        next: res => {
          this.graph = res as TenantConnectivityGraph;
          console.log('Graph data:', this.graph);
          setTimeout(() => this.renderGraph(), 100);
        },
      });
    }
  }

  saveConfig(): void {
    if (this.isSubmitting) {
      return;
    }
    this.isSubmitting = true;
    this.orchestrator.configureTenantInfrastructure({ tenantInfrastructureConfigDto: this.config }).subscribe({
      next: res => {
        console.log('Config saved:', res);
        this.saveResponse = res as TenantInfrastructureResponse;
        this.rightPanelView = 'response';
      },
      error: err => {
        this.validation = {
          success: false,
          errors: [
            {
              path: '$',
              message: err?.message || 'Request failed',
            } as any,
          ],
        } as TenantInfrastructureValidationResponse;
        this.showConfig();
      },
      complete: () => (this.isSubmitting = false),
    });
  }

  showConfig(): void {
    this.rightPanelView = 'config';
  }

  showResponse(): void {
    this.rightPanelView = 'response';
  }

  loadExistingConfig(): void {
    if (!this.tenantId) {
      return;
    }

    this.isLoadingConfig = true;
    this.orchestrator.getTenantInfrastructureConfig({ id: this.tenantId }).subscribe({
      next: config => {
        this.config = config as TenantInfrastructureConfigDto;
        this.updateRawFromConfig();
        this.rightPanelView = 'graph';
        this.generateGraphInternal();
      },
      error: err => {
        console.error('Failed to load tenant config:', err);
        // Fallback to empty config
        this.config = {
          tenant: { name: '', environmentId: '', alias: '', description: '' },
          externalFirewalls: [],
          vrfs: [],
        } as TenantInfrastructureConfigDto;
        this.updateRawFromConfig();
      },
      complete: () => {
        this.isLoadingConfig = false;
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
        containerSelector: '#graphContainer',
        svgSelector: '#graphSvg',
        hideEdgeTypes: ['TENANT_CONTAINS_FIREWALL'],
      });
    }, 100);
  }

  showGraph(): void {
    this.rightPanelView = 'graph';
    if (this.graph) {
      this.renderGraph();
    }
  }

  // UI helpers
  onConfigMutated(): void {
    this.validation = null;
    this.hasValidated = false;
    this.validationErrors.clear(); // Clear field-level errors on changes
    this.updateRawFromConfig();
    if (this.rightPanelView === 'graph') {
      this.graphUpdateSubject.next();
    }
  }

  // Error indicator helpers
  get tenantTabHasErrors(): boolean {
    return Array.from(this.validationErrors.keys()).some(path => path.startsWith('tenant.'));
  }

  get firewallsTabHasErrors(): boolean {
    return Array.from(this.validationErrors.keys()).some(path => path.startsWith('externalFirewalls.'));
  }

  get vrfsTabHasErrors(): boolean {
    return Array.from(this.validationErrors.keys()).some(path => path.startsWith('vrfs.'));
  }

  hasFirewallErrors(index: number): boolean {
    return Array.from(this.validationErrors.keys()).some(path => path.startsWith(`externalFirewalls.${index}.`));
  }

  hasVrfErrors(index: number): boolean {
    return Array.from(this.validationErrors.keys()).some(path => path.startsWith(`vrfs.${index}.`));
  }

  hasServiceGraphErrors(vrfIndex: number, sgIndex: number): boolean {
    return Array.from(this.validationErrors.keys()).some(path => path.startsWith(`vrfs.${vrfIndex}.serviceGraphs.${sgIndex}.`));
  }

  hasL3OutErrors(vrfIndex: number, l3Index: number): boolean {
    return Array.from(this.validationErrors.keys()).some(path => path.startsWith(`vrfs.${vrfIndex}.l3outs.${l3Index}.`));
  }

  hasExternalVrfConnectionErrors(firewallIndex: number, connIndex: number): boolean {
    return Array.from(this.validationErrors.keys()).some(path =>
      path.startsWith(`externalFirewalls.${firewallIndex}.externalVrfConnections.${connIndex}.`),
    );
  }

  private updateRawFromConfig(): void {
    try {
      if (this.previewFormat === 'json') {
        this.rawJson = JSON.stringify(this.config, null, 2);
      } else {
        this.rawJson = yaml.dump(this.config, { noRefs: true, indent: 2 });
      }
      this.parseError = null;
    } catch (e: any) {
      this.parseError = e?.message || `Unable to convert to ${this.previewFormat.toUpperCase()}`;
    }
  }

  onFormatChange(): void {
    this.updateRawFromConfig();
  }

  copyToClipboard(): void {
    navigator.clipboard
      ?.writeText(this.rawJson)
      .then(() => {
        // Could add a toast notification here
        console.log('Configuration copied to clipboard');
      })
      .catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = this.rawJson;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        console.log('Configuration copied to clipboard (fallback)');
      });
  }

  setActiveTab(tab: 'tenant' | 'firewalls' | 'vrfs'): void {
    this.activeTab = tab;
  }

  // Firewalls
  addFirewall(): void {
    this.config.externalFirewalls.push({
      name: 'new-firewall',
      firewallDeviceType: 'PaloAlto',
      vsysName: '',
      bgpAsn: null,
      bgpAsnAutoGenerate: true,
      externalVrfConnections: [] as any[],
    } as any);
    this.selectedFirewallIdx = this.config.externalFirewalls.length - 1;
    this.onConfigMutated();
  }
  removeFirewall(i: number): void {
    this.config.externalFirewalls.splice(i, 1);
    if (this.selectedFirewallIdx >= this.config.externalFirewalls.length) {
      this.selectedFirewallIdx = 0;
    }
    this.onConfigMutated();
  }
  addExternalVrfConnection(fwIdx: number): void {
    const fw = this.config.externalFirewalls[fwIdx] as any;
    fw.externalVrfConnections.push({
      name: 'connection',
      externalVrf: '',
      injectDefaultRouteFromExternalVrf: false,
      allowAllRoutesFromExternalVrf: false,
      advertiseHostBasedRoutesToExternalVrf: false,
      advertiseAllRoutesToExternalVrf: false,
    });
    this.onConfigMutated();
  }
  removeExternalVrfConnection(fwIdx: number, i: number): void {
    const fw = this.config.externalFirewalls[fwIdx] as any;
    fw.externalVrfConnections.splice(i, 1);
    this.onConfigMutated();
  }

  // VRFs
  addVrf(): void {
    this.config.vrfs.push({
      name: 'new-vrf',
      alias: '',
      maxExternalRoutes: 0,
      bgpAsn: null,
      bgpAsnAutoGenerate: true,
      serviceGraphs: [] as any[],
      l3outs: [] as any[],
    } as any);
    this.selectedVrfIdx = this.config.vrfs.length - 1;
    this.onConfigMutated();
  }
  removeVrf(i: number): void {
    this.config.vrfs.splice(i, 1);
    if (this.selectedVrfIdx >= this.config.vrfs.length) {
      this.selectedVrfIdx = 0;
    }
    this.onConfigMutated();
  }
  addServiceGraph(vrfIdx: number): void {
    const vrf = this.config.vrfs[vrfIdx] as any;
    vrf.serviceGraphs.push({
      name: 'new-sg',
      serviceGraphFirewall: { name: 'new-sg-fw', firewallDeviceType: 'PaloAlto', vsysName: '' },
    });
    this.onConfigMutated();
  }
  removeServiceGraph(vrfIdx: number, i: number): void {
    const vrf = this.config.vrfs[vrfIdx] as any;
    vrf.serviceGraphs.splice(i, 1);
    this.onConfigMutated();
  }
  addL3Out(vrfIdx: number): void {
    const vrf = this.config.vrfs[vrfIdx] as any;
    vrf.l3outs.push({ name: 'new-l3out', l3outType: 'external', externalFirewall: '' });
    this.onConfigMutated();
  }
  removeL3Out(vrfIdx: number, i: number): void {
    const vrf = this.config.vrfs[vrfIdx] as any;
    vrf.l3outs.splice(i, 1);
    this.onConfigMutated();
  }

  trackByIdx(_i: number): any {
    return _i;
  }
}
