import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, Subscription } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
import {
  V2AdminTenantOrchestratorService,
  TenantInfrastructureConfigDto,
  TenantInfrastructureValidationResponse,
  TenantConnectivityGraph,
  TenantInfrastructureResponse,
  V3GlobalEnvironmentsService,
  Environment,
  V3GlobalBgpRangesService,
  GlobalBgpAsnRange,
} from 'client';
import * as yaml from 'js-yaml';
import { Subject, debounceTime } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { trigger, style, transition, animate } from '@angular/animations';
import { TenantGraphCoreService } from '../../../services/tenant-graph/tenant-graph-core.service';
import AsnUtil from 'src/app/utils/AsnUtil';

@Component({
  selector: 'app-tenant-infrastructure',
  templateUrl: './tenant-infrastructure.component.html',
  styleUrls: ['./tenant-infrastructure.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('300ms ease-in', style({ transform: 'translateX(0%)', opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms ease-out', style({ transform: 'translateX(-100%)', opacity: 0 }))]),
    ]),
  ],
})
export class TenantInfrastructureComponent implements OnInit, OnDestroy {
  graph: TenantConnectivityGraph | null = null;
  mode: 'create' | 'edit' = 'create';
  tenantId?: string;
  private sub?: Subscription;

  environments: Environment[] = [];
  bgpRanges: GlobalBgpAsnRange[] = [];
  displayConfig = '';
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
  externalVrfOptions: string[] = [];
  previewFormat: 'json' | 'yaml' = 'json';
  rightPanelView: 'config' | 'graph' | 'response' = 'config';
  private graphUpdateSubject = new Subject<void>();
  private graphUpdateSubscription?: Subscription;
  leftPanelCollapsed = false;
  hasUnsavedChanges = false;
  debounceTimeMs = 2000;
  copyButtonText = 'Copy to Clipboard';
  copyButtonState: 'idle' | 'success' | 'error' = 'idle';
  bgpAsnDisplayValues: Map<string, string> = new Map(); // key: 'firewall_0' or 'vrf_0', value: display string
  AsnUtil = AsnUtil; // Expose for template access

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orchestrator: V2AdminTenantOrchestratorService,
    private tenantGraphCore: TenantGraphCoreService,
    private clipboard: Clipboard,
    private globalEnvironmentService: V3GlobalEnvironmentsService,
    private bgpRangesService: V3GlobalBgpRangesService,
    private ngx: NgxSmartModalService,
  ) {}

  ngOnInit(): void {
    // id comes from the parent route (admin portal child route: edit/:id)
    this.sub =
      this.route.parent?.paramMap.subscribe(params => {
        const id = params.get('id');
        this.tenantId = id || undefined;
        this.mode = id ? 'edit' : 'create';
      }) || undefined;

    this.getEnvironments();

    // Seed example JSON/config
    if (this.mode === 'create') {
      this.config = {
        tenant: {
          name: 'tenant1',
          environmentId: '',
          bgpRangeId: '',
          alias: 'Tenant 1',
          description: '',
        },
        externalFirewalls: [
          {
            name: 'ext-fw',
            firewallDeviceType: 'PaloAlto',
            vsysName: 'vsys1',
            bgpAsn: null,
            bgpAsnAutoGenerate: true,
            routingCost: 0,
            externalVrfConnections: [
              {
                name: 'ext-conn1',
                externalVrf: 'cmsnet_transport',
                injectDefaultRouteFromExternalVrf: false,
                allowAllRoutesFromExternalVrf: false,
                advertiseHostBasedRoutesToExternalVrf: false,
                advertiseAllRoutesToExternalVrf: false,
              },
            ] as any[],
          },
        ],
        vrfs: [
          {
            name: 'default_vrf',
            alias: 'Default VRF',
            displayOrder: null,
            maxExternalRoutes: 150,
            bgpAsn: null,
            bgpAsnAutoGenerate: true,
            serviceGraphs: [
              {
                name: 'sg1',
                serviceGraphFirewall: {
                  name: 'sg-fw',
                  firewallDeviceType: 'PaloAlto',
                  vsysName: 'vsys2',
                },
              },
            ] as any[],
            l3outs: [{ name: 'l3out1', l3outType: 'external', externalFirewall: 'ext-fw' }] as any[],
          },
        ],
      } as TenantInfrastructureConfigDto;
    } else if (this.mode === 'edit' && this.tenantId) {
      this.loadExistingConfig();
    }

    if (this.mode === 'create') {
      this.updateRawFromConfig();
    }

    // Setup debounced graph updates
    this.graphUpdateSubscription = this.graphUpdateSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe(() => {
      if (this.rightPanelView === 'graph') {
        this.generateGraphInternal();
      }
    });

    if (this.mode === 'edit') {
      this.generateGraphInternal();
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.graphUpdateSubscription?.unsubscribe();
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.hasUnsavedChanges && this.mode === 'create') {
      $event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
  }

  goBack(): void {
    this.router.navigate(['/adminportal/tenant-v2'], { queryParamsHandling: 'merge' });
  }

  onTextChange(): void {
    this.validation = null;
    try {
      let obj: any;
      if (this.previewFormat === 'json') {
        obj = JSON.parse(this.displayConfig);
      } else {
        obj = yaml.load(this.displayConfig);
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

    this.orchestrator
      .validateTenantInfrastructureTenantOrchestrator({ tenantInfrastructureConfigDto: this.config })
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        }),
      )
      .subscribe({
        next: res => {
          this.validation = res as TenantInfrastructureValidationResponse;
          this.hasValidated = true;
          this.showConfig();
        },
        error: err => {
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
      });
  }

  private parseValidationError(message: string): void {
    // Parse messages like "externalFirewalls.0.bgpAsn must be provided if bgpAsnAutoGenerate is not true"
    // Extract the path part before the first space
    const path = this.extractPathFromMessage(message);
    if (path) {
      this.validationErrors.set(path, message);
    }
  }

  private extractPathFromMessage(message: string): string | null {
    // Extract the path part before the first space from messages like "tenant.environmentId must be a UUID"
    const pathMatch = message.match(/^([a-zA-Z0-9.\[\]]+)/);
    return pathMatch ? pathMatch[1] : null;
  }

  getFieldError(path: string): string | null {
    return this.validationErrors.get(path) || null;
  }

  hasFieldError(path: string): boolean {
    const hasError = this.validationErrors.has(path);
    return hasError;
  }

  getEnvironments(): void {
    this.globalEnvironmentService.getManyEnvironments().subscribe(envs => {
      this.environments = envs || [];
    });
  }

  onEnvironmentChange(): void {
    this.onConfigMutated();
    const environmentId = this.config.tenant.environmentId;
    if (environmentId) {
      this.loadBgpRanges(environmentId);
    } else {
      this.bgpRanges = [];
      this.config.tenant.bgpRangeId = '';
    }
  }

  loadBgpRanges(environmentId: string): void {
    this.bgpRangesService.listRangesByEnvironmentGlobalBgpAsn({ environmentId }).subscribe({
      next: ranges => {
        this.bgpRanges = ranges || [];
        if (this.bgpRanges.length === 0) {
          this.config.tenant.bgpRangeId = '';
        } else if (!this.bgpRanges.find(r => r.id === this.config.tenant.bgpRangeId)) {
          this.config.tenant.bgpRangeId = '';
        }
      },
      error: () => {
        this.bgpRanges = [];
        this.config.tenant.bgpRangeId = '';
      },
    });
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
      this.orchestrator.buildTenantInfrastructureGraphTenantOrchestrator({ tenantInfrastructureConfigDto: this.config }).subscribe({
        next: res => {
          this.graph = res as TenantConnectivityGraph;
          setTimeout(() => this.renderGraph(), 100);
        },
        error: err => {
          console.error(err);
        },
      });
    } else if (this.mode === 'edit') {
      this.orchestrator.getTenantInfrastructureGraphTenantOrchestrator({ id: this.tenantId }).subscribe({
        next: res => {
          this.graph = res as TenantConnectivityGraph;
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
    this.orchestrator
      .configureTenantInfrastructureTenantOrchestrator({ tenantInfrastructureConfigDto: this.config })
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        }),
      )
      .subscribe({
        next: res => {
          this.saveResponse = res as TenantInfrastructureResponse;
          this.hasUnsavedChanges = false; // Clear unsaved changes flag
          this.rightPanelView = 'response';
        },
        error: err => {
          console.error(err);
          this.validationErrors.clear();

          // Parse class-validator errors from API response
          if (err?.error?.detail?.message && Array.isArray(err.error.detail.message)) {
            err.error.detail.message.forEach((msg: string) => {
              this.parseValidationError(msg);
            });
          }

          // Create validation response with proper error objects
          if (err?.error?.detail?.message && Array.isArray(err.error.detail.message)) {
            this.validation = {
              success: false,
              errors: err.error.detail.message.map((msg: string) => ({
                path: this.extractPathFromMessage(msg) || '$',
                message: msg,
              } as any)),
            } as TenantInfrastructureValidationResponse;
          } else {
            // Fallback for non-validation errors
            const errorMessage = err?.error?.detail?.message
              ? (Array.isArray(err.error.detail.message) ? err.error.detail.message.join('; ') : err.error.detail.message)
              : err?.message || 'Request failed';

            this.validation = {
              success: false,
              errors: [
                {
                  path: '$',
                  message: errorMessage,
                } as any,
              ],
            } as TenantInfrastructureValidationResponse;
          }
          this.showConfig();
        },
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
    this.orchestrator
      .getTenantInfrastructureConfigTenantOrchestrator({ id: this.tenantId })
      .pipe(
        finalize(() => {
          this.isLoadingConfig = false;
        }),
      )
      .subscribe({
        next: config => {
          this.config = config as TenantInfrastructureConfigDto;
          if (this.config.tenant.environmentId) {
            this.loadBgpRanges(this.config.tenant.environmentId);
          }
          // Initialize BGP ASN display values from loaded config
          this.initializeBgpAsnDisplayValues();
          this.updateRawFromConfig();
          this.rightPanelView = 'graph';
          this.generateGraphInternal();
        },
        error: () => {
          this.config = {
            tenant: { name: '', environmentId: '', bgpRangeId: '', alias: '', description: '' },
            externalFirewalls: [],
            vrfs: [],
          } as TenantInfrastructureConfigDto;
          this.updateRawFromConfig();
        },
      });
  }

  private renderGraph(): void {
    if (!this.graph) {
      return;
    }

    // Use setTimeout to ensure DOM elements are rendered
    setTimeout(() => {
      this.tenantGraphCore.renderGraph({
        graph: this.graph,
        containerSelector: '#graphContainer',
        svgSelector: '#graphSvg',
        hideEdgeTypes: ['TENANT_CONTAINS_FIREWALL', 'INTERVRF_CONNECTION'],
        enableContextMenu: true,
        enablePathTrace: true,
        contextMenuConfig: {}, // Empty context menu config
        defaultEdgeWidth: 1.2,
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
    this.hasUnsavedChanges = true;
    this.validationErrors.clear(); // Clear field-level errors on changes
    this.updateRawFromConfig();
    if (this.rightPanelView === 'graph') {
      this.graphUpdateSubject.next();
    }
  }

  toggleLeftPanel(): void {
    this.leftPanelCollapsed = !this.leftPanelCollapsed;
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
        this.displayConfig = JSON.stringify(this.config, null, 2);
      } else {
        this.displayConfig = yaml.dump(this.config, { noRefs: true, indent: 2 });
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
    // Validate that there's content to copy
    if (!this.displayConfig || this.displayConfig.trim() === '') {
      this.showCopyFeedback('No configuration content to copy', 'error');
      return;
    }

    // Use Angular CDK Clipboard service
    const successful = this.clipboard.copy(this.displayConfig);

    if (successful) {
      this.showCopyFeedback('Configuration copied to clipboard!', 'success');
    } else {
      this.showCopyFeedback('Failed to copy to clipboard. Please copy manually.', 'error');
    }
  }

  private showCopyFeedback(message: string, type: 'success' | 'error'): void {
    // Update component properties instead of DOM manipulation
    this.copyButtonText = type === 'success' ? '✓ Copied!' : '✗ Failed';
    this.copyButtonState = type;

    // Reset after 2 seconds
    setTimeout(() => {
      this.copyButtonText = 'Copy to Clipboard';
      this.copyButtonState = 'idle';
    }, 2000);
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
      routingCost: 0,
      externalVrfConnections: [] as any[],
    } as any);
    this.selectedFirewallIdx = this.config.externalFirewalls.length - 1;
    this.onConfigMutated();
  }
  removeFirewall(i: number): void {
    const firewall = this.config.externalFirewalls[i];
    const modalDto = new YesNoModalDto(
      'Confirm Removal',
      `Are you sure you want to remove firewall "${firewall.name || 'unnamed'}"?`,
      'Remove',
      'Cancel',
      'danger',
    );

    const onConfirm = () => {
      this.config.externalFirewalls.splice(i, 1);
      if (this.selectedFirewallIdx >= this.config.externalFirewalls.length) {
        this.selectedFirewallIdx = 0;
      }
      this.onConfigMutated();
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
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
    const connection = fw.externalVrfConnections[i];
    const modalDto = new YesNoModalDto(
      'Confirm Removal',
      `Are you sure you want to remove VRF connection "${connection.name || 'unnamed'}"?`,
      'Remove',
      'Cancel',
      'danger',
    );

    const onConfirm = () => {
      fw.externalVrfConnections.splice(i, 1);
      this.onConfigMutated();
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  // VRFs
  addVrf(): void {
    this.config.vrfs.push({
      name: 'new-vrf',
      alias: '',
      displayOrder: null,
      maxExternalRoutes: 0,
      bgpAsn: null,
      bgpAsnAutoGenerate: true,
      serviceGraphs: [] as any[],
      l3outs: [] as any[],
    } as any);
    this.selectedVrfIdx = this.config.vrfs.length - 1;
    this.updateVrfDisplayOrders();
    this.onConfigMutated();
  }

  removeVrf(i: number): void {
    const vrf = this.config.vrfs[i];
    const modalDto = new YesNoModalDto(
      'Confirm Removal',
      `Are you sure you want to remove VRF "${vrf.name || 'unnamed'}"?`,
      'Remove',
      'Cancel',
      'danger',
    );

    const onConfirm = () => {
      this.config.vrfs.splice(i, 1);
      if (this.selectedVrfIdx >= this.config.vrfs.length) {
        this.selectedVrfIdx = 0;
      }
      this.updateVrfDisplayOrders();
      this.onConfigMutated();
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  moveVrfUp(i: number): void {
    if (i > 0) {
      // Swap with previous VRF
      const temp = this.config.vrfs[i];
      this.config.vrfs[i] = this.config.vrfs[i - 1];
      this.config.vrfs[i - 1] = temp;

      // Update selected index if needed
      if (this.selectedVrfIdx === i) {
        this.selectedVrfIdx = i - 1;
      } else if (this.selectedVrfIdx === i - 1) {
        this.selectedVrfIdx = i;
      }

      this.updateVrfDisplayOrders();
      this.onConfigMutated();
    }
  }

  moveVrfDown(i: number): void {
    if (i < this.config.vrfs.length - 1) {
      // Swap with next VRF
      const temp = this.config.vrfs[i];
      this.config.vrfs[i] = this.config.vrfs[i + 1];
      this.config.vrfs[i + 1] = temp;

      // Update selected index if needed
      if (this.selectedVrfIdx === i) {
        this.selectedVrfIdx = i + 1;
      } else if (this.selectedVrfIdx === i + 1) {
        this.selectedVrfIdx = i;
      }

      this.updateVrfDisplayOrders();
      this.onConfigMutated();
    }
  }

  private updateVrfDisplayOrders(): void {
    // Update displayOrder based on array position (1-based indexing)
    this.config.vrfs.forEach((vrf: any, index: number) => {
      vrf.displayOrder = index + 1;
    });
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
    const sg = vrf.serviceGraphs[i];
    const modalDto = new YesNoModalDto(
      'Confirm Removal',
      `Are you sure you want to remove service graph "${sg.name || 'unnamed'}"?`,
      'Remove',
      'Cancel',
      'danger',
    );

    const onConfirm = () => {
      vrf.serviceGraphs.splice(i, 1);
      this.onConfigMutated();
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }
  addL3Out(vrfIdx: number): void {
    const vrf = this.config.vrfs[vrfIdx] as any;
    vrf.l3outs.push({ name: 'new-l3out', l3outType: 'external', externalFirewall: '' });
    this.onConfigMutated();
  }
  removeL3Out(vrfIdx: number, i: number): void {
    const vrf = this.config.vrfs[vrfIdx] as any;
    const l3out = vrf.l3outs[i];
    const modalDto = new YesNoModalDto(
      'Confirm Removal',
      `Are you sure you want to remove L3Out "${l3out.name || 'unnamed'}"?`,
      'Remove',
      'Cancel',
      'danger',
    );

    const onConfirm = () => {
      vrf.l3outs.splice(i, 1);
      this.onConfigMutated();
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  trackByIdx(_i: number): any {
    return _i;
  }

  private initializeBgpAsnDisplayValues(): void {
    this.bgpAsnDisplayValues.clear();
    // Initialize firewall BGP ASN display values
    this.config.externalFirewalls?.forEach((fw, idx) => {
      if (fw.bgpAsn !== null && fw.bgpAsn !== undefined && fw.bgpAsn !== '') {
        // bgpAsn comes from API as string, use it directly as display value
        this.bgpAsnDisplayValues.set(`firewall_${idx}`, String(fw.bgpAsn));
      }
    });
    // Initialize VRF BGP ASN display values
    this.config.vrfs?.forEach((vrf, idx) => {
      if (vrf.bgpAsn !== null && vrf.bgpAsn !== undefined && vrf.bgpAsn !== '') {
        // bgpAsn comes from API as string, use it directly as display value
        this.bgpAsnDisplayValues.set(`vrf_${idx}`, String(vrf.bgpAsn));
      }
    });
  }

  // BGP ASN input handlers (component-specific logic)
  onBgpAsnInput(firewallIdx: number, value: string): void {
    const key = `firewall_${firewallIdx}`;
    this.bgpAsnDisplayValues.set(key, value);
    const asPlain = AsnUtil.convertBgpAsnToAsPlain(value);
    this.config.externalFirewalls[firewallIdx].bgpAsn = asPlain !== null ? asPlain.toString() : undefined;
    this.onConfigMutated();
  }

  onVrfBgpAsnInput(vrfIdx: number, value: string): void {
    const key = `vrf_${vrfIdx}`;
    this.bgpAsnDisplayValues.set(key, value);
    const asPlain = AsnUtil.convertBgpAsnToAsPlain(value);
    this.config.vrfs[vrfIdx].bgpAsn = asPlain !== null ? asPlain.toString() : undefined;
    this.onConfigMutated();
  }

  getBgpAsnDisplayValue(firewallIdx: number | null, vrfIdx: number | null): string {
    if (firewallIdx !== null) {
      const key = `firewall_${firewallIdx}`;
      if (this.bgpAsnDisplayValues.has(key)) {
        return this.bgpAsnDisplayValues.get(key) || '';
      }
      const value = this.config.externalFirewalls[firewallIdx]?.bgpAsn;
      if (value !== null && value !== undefined) {
        return String(value);
      }
    }
    if (vrfIdx !== null) {
      const key = `vrf_${vrfIdx}`;
      if (this.bgpAsnDisplayValues.has(key)) {
        return this.bgpAsnDisplayValues.get(key) || '';
      }
      const value = this.config.vrfs[vrfIdx]?.bgpAsn;
      if (value !== null && value !== undefined) {
        return String(value);
      }
    }
    return '';
  }
}
