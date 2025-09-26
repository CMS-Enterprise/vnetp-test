import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Datacenter,
  FirewallRuleGroup,
  GetManyTenantResponseDto,
  NatRuleGroup,
  Tier,
  V2AppCentricTenantsService,
  Vrf,
  Tenant,
} from 'client';
import { Tab, TabsComponent } from 'src/app/common/tabs/tabs.component';
import { ApplicationMode } from 'src/app/models/other/application-mode-enum';
import { V1DatacentersService } from 'client';
import { V1TiersService } from 'client';
import { TierContextService } from 'src/app/services/tier-context.service';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { RouteDataUtil } from '../../../../utils/route-data.util';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

const tabs: Tab[] = [
  { name: 'VRF', route: ['vrf'], id: 'vrf' },
  { name: 'L3 Outs', route: ['l3-outs'], id: 'l3-outs' },
  { name: 'Bridge Domain', route: ['bridge-domain'], id: 'bridge-domain' },
  { name: 'Application Profile', route: ['application-profile'], id: 'application-profile' },
  { name: 'Endpoint Group', route: ['endpoint-group'], id: 'endpoint-group' },
  { name: 'Endpoint Security Group', route: ['endpoint-security-group'], id: 'endpoint-security-group' },
  { name: 'Contract', route: ['contract'], id: 'contract' },
  { name: 'Filter', route: ['filter'], id: 'filter' },
  {
    name: 'Service Graphs',
    tooltip: 'Manage service graphs and their firewall configurations.',
    id: 'tv2-service-graphs',
    route: ['service-graphs'],
  },
  {
    name: 'External Firewalls',
    tooltip: 'Manage external firewalls and their configurations.',
    id: 'tv2-external-firewalls',
    route: ['external-firewalls'],
  },
  {
    name: 'Graph',
    tooltip: 'View the complete tenant connectivity graph showing all entities and their relationships.',
    id: 'tv2-tenant-graph',
    route: ['tenant-graph'],
  },
  {
    name: 'Endpoint Connectivity Utility',
    tooltip: 'This utility allows you to test the connectivity between endpoints.',
    id: 'tv2-endpoint-connectivity-utility',
    route: ['endpoint-connectivity-utility'],
  },
  {
    name: 'Workflows',
    tooltip: 'This tab allows you to create and manage workflows for your tenant.',
    id: 'tv2-workflows',
    route: ['workflows'],
  },
];

@Component({
  selector: 'app-tenant-portal',
  templateUrl: './tenant-portal.component.html',
})
export class TenantPortalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('tabsRef') tabsComponent: TabsComponent;

  public initialTabIndex = 0;
  public currentTab: string;
  public initialSubTab: Tab | null = null;
  public tenants: GetManyTenantResponseDto;
  public currentTenant: Tenant;
  public currentTenantName: string;
  public tenantId: string;
  public applicationMode: ApplicationMode;
  public ApplicationMode = ApplicationMode;
  public networkServicesContainerDatacenter: Datacenter;

  // Loading states
  public isLoadingTenant = false;
  public isLoadingVrfData = false;
  public isLoadingTiers = false;

  // VRF-based properties with improved type safety
  public tenantVrfs: Vrf[] = [];
  public selectedVrf: Vrf | null = null;
  public selectedVrfInternalTier: Tier | null = null;
  public selectedVrfExternalTier: Tier | null = null;
  public selectedVrfInternalFirewallRuleGroup: FirewallRuleGroup | null = null;
  public selectedVrfExternalFirewallRuleGroup: FirewallRuleGroup | null = null;
  public selectedVrfInternalNatRuleGroup: NatRuleGroup | null = null;
  public selectedVrfExternalNatRuleGroup: NatRuleGroup | null = null;

  public tabs: Tab[] = [];

  // Subscription management
  private destroy$ = new Subject<void>();
  private subscriptions: Subscription[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private tenantService: V2AppCentricTenantsService,
    private datacenterService: V1DatacentersService,
    private tierService: V1TiersService,
    private tierContextService: TierContextService,
    private datacenterContextService: DatacenterContextService,
  ) {}

  private initializeTabs(): void {
    if (this.applicationMode === ApplicationMode.TENANTV2) {
      // Show all tabs including firewalls for V2, preserving subTabs
      this.datacenterContextService.refreshDatacenters();
      this.tabs = [...tabs];
    } else {
      // Filter out tenant v2 tabs
      this.tabs = tabs.filter(t => !t?.id?.startsWith('tv2-'));
    }
    // Set a default current tab to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.currentTab = this.tabs[0]?.name || 'Application Profile';
  }

  /**
   * Type guard to check if a tab has a valid ID
   */
  private hasValidTabId(tab: Tab | null | undefined): tab is Tab & { id: string } {
    return !!tab?.id;
  }

  /**
   * Type guard to check if a tab has a valid route
   */
  private hasValidRoute(tab: Tab | null | undefined): tab is Tab & { route: string[] } {
    return !!tab?.route?.[0];
  }

  /**
   * Get current tab ID safely
   */
  private getCurrentTabId(): string | null {
    const currentTab = this.tabs.find(tab => tab.name === this.currentTab);
    return currentTab?.id || null;
  }

  /**
   * Select a VRF and load its associated tiers and rule groups
   */
  public selectVrf(vrf: Vrf | null): void {
    if (!vrf) {
      console.warn('Cannot select null VRF');
      return;
    }

    this.selectedVrf = vrf;
    this.isLoadingVrfData = true;
    this.loadVrfTiersAndRuleGroups(vrf);
  }

  /**
   * Load tiers and rule groups for the selected VRF
   */
  private loadVrfTiersAndRuleGroups(vrf: Vrf): void {
    if (!vrf) {
      console.warn('Cannot load tiers for null VRF');
      this.isLoadingVrfData = false;
      return;
    }

    this.selectedVrfInternalTier = vrf.internalNetworkServicesTier || null;
    this.selectedVrfExternalTier = vrf.externalNetworkServicesTier || null;

    // If we have tier IDs but not the full tier objects with rule groups, fetch them
    const internalTierId = this.selectedVrfInternalTier?.id;
    const externalTierId = this.selectedVrfExternalTier?.id;

    if (internalTierId || externalTierId) {
      const tierIds = [internalTierId, externalTierId].filter(Boolean) as string[];

      if (tierIds.length > 0) {
        this.isLoadingTiers = true;

        // Get the full tier objects with rule groups
        this.tierService
          .getManyTier({
            filter: [`id||in||${tierIds.join(',')}`],
            join: ['firewallRuleGroups', 'natRuleGroups'],
            page: 1,
            perPage: 10,
          })
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: tierResponse => {
              try {
                if (!tierResponse?.data) {
                  throw new Error('Invalid tier response data');
                }

                const tiersById = new Map(tierResponse.data.map(t => [t.id, t]));

                // Update internal tier and rule groups with type safety
                if (internalTierId) {
                  const fullInternalTier = tiersById.get(internalTierId);
                  if (fullInternalTier) {
                    this.selectedVrfInternalTier = fullInternalTier;
                    this.selectedVrfInternalFirewallRuleGroup = fullInternalTier.firewallRuleGroups?.[0] || null;
                    this.selectedVrfInternalNatRuleGroup = fullInternalTier.natRuleGroups?.[0] || null;
                  }
                }

                // Update external tier and rule groups with type safety
                if (externalTierId) {
                  const fullExternalTier = tiersById.get(externalTierId);
                  if (fullExternalTier) {
                    this.selectedVrfExternalTier = fullExternalTier;
                    this.selectedVrfExternalFirewallRuleGroup = fullExternalTier.firewallRuleGroups?.[0] || null;
                    this.selectedVrfExternalNatRuleGroup = fullExternalTier.natRuleGroups?.[0] || null;
                  }
                }

                this.isLoadingTiers = false;
                this.isLoadingVrfData = false;
              } catch (error) {
                this.isLoadingTiers = false;
                this.isLoadingVrfData = false;
              }
            },
            error: () => {
              this.isLoadingTiers = false;
              this.isLoadingVrfData = false;
            },
          });
      }
    } else {
      // If no additional loading needed
      this.isLoadingVrfData = false;
    }
  }

  /**
   * Helper method to switch tier context safely
   */
  private switchTierContext(tierId: string): void {
    this.tierContextService.unlockTier();
    this.tierContextService.switchTier(tierId);
    this.tierContextService.lockTier();
  }

  public async handleTabChange(tab: Tab): Promise<any> {
    console.log('handleTabChange', tab);
    if (!tab) {
      return;
    }

    // Update current tab unless this is a sub-tab
    if (!tab.isSubTab) {
      this.currentTab = tab.name;
    }

    if (tab.route) {
      await this.router.navigate([{ outlets: { 'tenant-portal': tab.route } }], {
        queryParamsHandling: 'merge',
        relativeTo: this.activatedRoute,
      });
      return;
    }
  }

  public getTenant(): void {
    this.isLoadingTenant = true;
    this.tenantService
      .getOneTenant({
        id: this.tenantId,
        join: ['vrfs'],
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        response => {
          this.currentTenant = response;
          this.currentTenantName = response.name;
          this.isLoadingTenant = false;

          if (this.applicationMode === ApplicationMode.TENANTV2 && response.tenantVersion === 2) {
            this.tenantVrfs = response.vrfs || [];
            this.initializeVrfSelection();
            // this.getNetworkServicesContainerDatacenter(response.datacenterId);
          }
        },
        () => {
          this.tenants = null;
          this.isLoadingTenant = false;
        },
      );
  }

  /**
   * Initialize VRF selection - select first VRF or only VRF if there's only one
   */
  private initializeVrfSelection(): void {
    if (!this.tenantVrfs || this.tenantVrfs.length === 0) {
      console.warn('No VRFs available for selection');
      return;
    }

    // If there's only one VRF or if no VRF is selected yet, select the first one
    if (this.tenantVrfs.length === 1 || !this.selectedVrf) {
      const firstVrf = this.tenantVrfs[0];
      if (firstVrf) {
        this.selectVrf(firstVrf);
      }
    }
  }

  ngOnInit(): void {
    // get tenantId in URL snapshot
    const match = this.router.routerState.snapshot.url.match(
      /tenant-select\/edit\/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}/,
    );
    if (match) {
      const uuid = match[0].split('/')[2];
      this.tenantId = uuid;
    }

    this.applicationMode = RouteDataUtil.getApplicationModeFromRoute(this.activatedRoute);
    // Initialize tabs first so we have something to show during loading
    this.initializeTabs();
    // Get initial tab index without calling getTenants() yet
    this.initialTabIndex = this.getInitialTabIndex();
    // Get tenant data
    this.getTenant();
  }

  ngAfterViewInit(): void {
    // If we have an initial sub-tab to select (set during getInitialTabIndex), select it now
    if (this.initialSubTab && this.tabsComponent) {
      this.tabsComponent.setActiveSubTab(this.initialSubTab);
    }
  }

  public getInitialTabIndex(): number {
    try {
      const currentUrl = this.router.url;
      const regex = /\(tenant-portal:([\w\/-]+)\)/g;
      const page = regex.exec(currentUrl);

      // Default to first tab if no match or no tabs available
      if (!page || !page[1] || !this.tabs.length) {
        const firstTab = this.tabs[0];
        this.currentTab = firstTab?.name || 'Application Profile';
        this.initialSubTab = null;
        return 0;
      }

      // Extract the route path and normalize it
      let adjustedPath = page[1];
      // Map old routes to new routes for backward compatibility
      adjustedPath = adjustedPath.replace(/east-west-/g, 'internal-');
      adjustedPath = adjustedPath.replace(/north-south-/g, 'external-');

      // Check sub-tabs first (more specific) with type safety
      for (const tab of this.tabs) {
        if (tab.subTabs && Array.isArray(tab.subTabs)) {
          for (const subTab of tab.subTabs) {
            if (this.hasValidRoute(subTab) && adjustedPath.includes(subTab.route[0])) {
              // Found matching sub-tab
              this.currentTab = tab.name;
              this.initialSubTab = subTab;
              const tabIndex = this.hasValidTabId(tab)
                ? this.tabs.findIndex(t => t.id === tab.id)
                : this.tabs.findIndex(t => t.name === tab.name);
              return Math.max(0, tabIndex);
            }
          }
        }
      }

      // Check main tabs with type safety
      for (const tab of this.tabs) {
        if (this.hasValidRoute(tab) && adjustedPath.includes(tab.route[0])) {
          this.currentTab = tab.name;
          this.initialSubTab = null;
          const tabIndex = this.hasValidTabId(tab)
            ? this.tabs.findIndex(t => t.id === tab.id)
            : this.tabs.findIndex(t => t.name === tab.name);
          return Math.max(0, tabIndex);
        }
      }

      // Fallback to first tab
      const fallbackTab = this.tabs[0];
      this.currentTab = fallbackTab?.name || 'VRF';
      this.initialSubTab = null;
      return 0;
    } catch (error) {
      const errorFallbackTab = this.tabs[0];
      this.currentTab = errorFallbackTab?.name || 'VRF';
      this.initialSubTab = null;
      return 0;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Clean up any remaining subscriptions
    this.subscriptions.forEach(sub => {
      if (!sub.closed) {
        sub.unsubscribe();
      }
    });
  }
}
