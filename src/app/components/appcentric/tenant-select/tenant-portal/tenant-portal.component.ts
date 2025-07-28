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
  { name: 'Application Profile', route: ['application-profile'], id: 'application-profile' },
  { name: 'Endpoint Group', route: ['endpoint-group'], id: 'endpoint-group' },
  { name: 'Endpoint Security Group', route: ['endpoint-security-group'], id: 'endpoint-security-group' },
  { name: 'Bridge Domain', route: ['bridge-domain'], id: 'bridge-domain' },
  { name: 'Contract', route: ['contract'], id: 'contract' },
  { name: 'Filter', route: ['filter'], id: 'filter' },
  { name: 'L3 Outs', route: ['l3-outs'], id: 'l3-outs' },
  { name: 'VRF', route: ['vrf'], id: 'vrf' },
  { name: 'Route Profile', route: ['route-profile'], id: 'route-profile' },
  {
    name: 'Internal Firewall',
    tooltip: 'These firewall rules are applied between ESGs and EPGs that have defined contracts.',
    id: 'tv2-internal-firewall',
    subTabs: [
      { name: 'Firewall Rules', route: ['internal-firewall'], id: 'tv2-internal-firewall-firewall-rules' },
      { name: 'NAT Rules', route: ['internal-nat'], id: 'tv2-internal-firewall-nat-rules' },
      { name: 'Service Objects', route: ['internal-service-objects'], id: 'tv2-internal-firewall-service-objects' },
    ],
  },
  {
    name: 'External Firewall',
    tooltip: 'These firewall rules are applied between the ACI environment and external networks.',
    id: 'tv2-external-firewall',
    subTabs: [
      { name: 'Firewall Rules', route: ['external-firewall'], id: 'tv2-external-firewall-firewall-rules' },
      { name: 'NAT Rules', route: ['external-nat'], id: 'tv2-external-firewall-nat-rules' },
      { name: 'Network Objects', route: ['external-network-objects'], id: 'tv2-external-firewall-network-objects' },
      { name: 'Service Objects', route: ['external-service-objects'], id: 'tv2-external-firewall-service-objects' },
    ],
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
   * Check if current context is internal firewall
   */
  private isInternalFirewallContext(currentTabId: string | null, parentTabId: string | null): boolean {
    return currentTabId === 'tv2-internal-firewall' || parentTabId === 'tv2-internal-firewall';
  }

  /**
   * Check if current context is external firewall
   */
  private isExternalFirewallContext(currentTabId: string | null, parentTabId: string | null): boolean {
    return currentTabId === 'tv2-external-firewall' || parentTabId === 'tv2-external-firewall';
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
                // After rule groups are loaded, re-trigger current subtab navigation
                this.retriggerCurrentSubtab();
              } catch (error) {
                this.isLoadingTiers = false;
                this.isLoadingVrfData = false;
              }
            },
            error: () => {
              this.isLoadingTiers = false;
              this.isLoadingVrfData = false;
              // Still attempt to retrigger with existing data
              this.retriggerCurrentSubtab();
            },
          });
      }
    } else {
      // If no additional loading needed, still check for navigation
      this.isLoadingVrfData = false;
      this.retriggerCurrentSubtab();
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

  /**
   * Navigate to a specific rule group with tier context switching
   */
  private navigateToRuleGroup(routePath: string[], ruleGroupId: string | null, tierId: string | null): void {
    if (ruleGroupId && tierId) {
      this.switchTierContext(tierId);
      this.router.navigate([{ outlets: { 'tenant-portal': [...routePath, 'edit', ruleGroupId] } }], {
        queryParamsHandling: 'merge',
        relativeTo: this.activatedRoute,
      });
    }
  }

  /**
   * Re-trigger the current subtab to navigate to the new VRF's rule group
   */
  private retriggerCurrentSubtab(): void {
    const currentUrl = this.router.url;

    // Define route mappings for cleaner logic
    const routeMappings = [
      {
        urlPattern: 'internal-firewall/edit/',
        routePath: ['internal-firewall'],
        ruleGroupId: this.selectedVrfInternalFirewallRuleGroup?.id || null,
        tierId: this.selectedVrfInternalTier?.id || null,
      },
      {
        urlPattern: 'external-firewall/edit/',
        routePath: ['external-firewall'],
        ruleGroupId: this.selectedVrfExternalFirewallRuleGroup?.id || null,
        tierId: this.selectedVrfExternalTier?.id || null,
      },
      {
        urlPattern: 'internal-nat/edit/',
        routePath: ['internal-nat'],
        ruleGroupId: this.selectedVrfInternalNatRuleGroup?.id || null,
        tierId: this.selectedVrfInternalTier?.id || null,
      },
      {
        urlPattern: 'external-nat/edit/',
        routePath: ['external-nat'],
        ruleGroupId: this.selectedVrfExternalNatRuleGroup?.id || null,
        tierId: this.selectedVrfExternalTier?.id || null,
      },
    ];

    // Find matching route and navigate
    const matchingRoute = routeMappings.find(route => currentUrl.includes(route.urlPattern));
    if (matchingRoute) {
      this.navigateToRuleGroup(matchingRoute.routePath, matchingRoute.ruleGroupId, matchingRoute.tierId);
    }
  }

  public async handleTabChange(tab: Tab): Promise<any> {
    if (!tab) {
      return;
    }

    // Get current tab ID and parent tab ID safely
    const currentTabId = this.getCurrentTabId();
    const parentTabId = currentTabId; // Store the parent context before potential change

    // Update current tab unless this is a sub-tab
    if (!tab.isSubTab) {
      this.currentTab = tab.name;
    }

    // Use the name of the tab to determine the action to take
    switch (tab.name) {
      case 'Internal Firewall':
        // Preset the Tier to the Internal Tier of selected VRF
        if (this.selectedVrfInternalTier?.id) {
          this.switchTierContext(this.selectedVrfInternalTier.id);
        }
        break;
      case 'External Firewall':
        // Preset the Tier to the External Tier of selected VRF
        if (this.selectedVrfExternalTier?.id) {
          this.switchTierContext(this.selectedVrfExternalTier.id);
        }
        break;
      case 'Network Objects':
        if (this.isExternalFirewallContext(currentTabId, parentTabId)) {
          if (this.selectedVrfExternalTier?.id) {
            this.switchTierContext(this.selectedVrfExternalTier.id);
            this.router.navigate([{ outlets: { 'tenant-portal': ['external-network-objects'] } }], {
              queryParamsHandling: 'merge',
              relativeTo: this.activatedRoute,
            });
          }
        }
        return;

      case 'Service Objects':
        // Check if we're under Internal or External based on parent tab context
        if (this.isInternalFirewallContext(currentTabId, parentTabId)) {
          if (this.selectedVrfInternalTier?.id) {
            this.switchTierContext(this.selectedVrfInternalTier.id);
            this.router.navigate([{ outlets: { 'tenant-portal': ['internal-service-objects'] } }], {
              queryParamsHandling: 'merge',
              relativeTo: this.activatedRoute,
            });
          }
        } else if (this.isExternalFirewallContext(currentTabId, parentTabId)) {
          if (this.selectedVrfExternalTier?.id) {
            this.switchTierContext(this.selectedVrfExternalTier.id);
            this.router.navigate([{ outlets: { 'tenant-portal': ['external-service-objects'] } }], {
              queryParamsHandling: 'merge',
              relativeTo: this.activatedRoute,
            });
          }
        }
        return;

      case 'Firewall Rules':
        // Check if we're under Internal or External based on parent tab context
        if (this.isInternalFirewallContext(currentTabId, parentTabId)) {
          this.navigateToRuleGroup(
            ['internal-firewall'],
            this.selectedVrfInternalFirewallRuleGroup?.id || null,
            this.selectedVrfInternalTier?.id || null,
          );
        } else if (this.isExternalFirewallContext(currentTabId, parentTabId)) {
          this.navigateToRuleGroup(
            ['external-firewall'],
            this.selectedVrfExternalFirewallRuleGroup?.id || null,
            this.selectedVrfExternalTier?.id || null,
          );
        }
        break;
      case 'NAT Rules':
        if (this.isInternalFirewallContext(currentTabId, parentTabId)) {
          this.navigateToRuleGroup(
            ['internal-nat'],
            this.selectedVrfInternalNatRuleGroup?.id || null,
            this.selectedVrfInternalTier?.id || null,
          );
        } else if (this.isExternalFirewallContext(currentTabId, parentTabId)) {
          this.navigateToRuleGroup(
            ['external-nat'],
            this.selectedVrfExternalNatRuleGroup?.id || null,
            this.selectedVrfExternalTier?.id || null,
          );
        }
        break;

      default:
        // For any other tab, look up its route and navigate using type-safe lookup
        const routeTab = this.hasValidTabId(tab) ? this.tabs.find(t => t.id === tab.id) : this.tabs.find(t => t.name === tab.name);

        if (routeTab && this.hasValidRoute(routeTab)) {
          this.router.navigate([{ outlets: { 'tenant-portal': routeTab.route } }], {
            queryParamsHandling: 'merge',
            relativeTo: this.activatedRoute,
          });
        } else if (this.hasValidRoute(tab)) {
          // If we couldn't find it in the lookup but it has a route, use that
          this.router.navigate([{ outlets: { 'tenant-portal': tab.route } }], {
            queryParamsHandling: 'merge',
            relativeTo: this.activatedRoute,
          });
        }
        break;
    }
  }

  public getTenant(): void {
    this.isLoadingTenant = true;
    this.tenantService
      .getOneTenant({
        id: this.tenantId,
        join: ['vrfs', 'vrfs.internalNetworkServicesTier', 'vrfs.externalNetworkServicesTier'],
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
            this.getNetworkServicesContainerDatacenter(response.datacenterId);
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

  public getNetworkServicesContainerDatacenter(datacenterId: string): void {
    this.datacenterService
      .getOneDatacenter({
        id: datacenterId,
        join: ['tiers', 'tiers.firewallRuleGroups', 'tiers.natRuleGroups'],
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.networkServicesContainerDatacenter = response;
          this.datacenterContextService.unlockDatacenter();
          this.datacenterContextService.switchDatacenter(response.id);
          this.datacenterContextService.lockDatacenter();

          // Load tiers and rule groups for the selected VRF
          if (this.selectedVrf) {
            this.loadVrfTiersAndRuleGroups(this.selectedVrf);
          }

          // Call getInitialTabIndex after we have all the necessary data
          this.getInitialTabIndex();
        },
        error: () => {
          // Still attempt to proceed with available data
          if (this.selectedVrf) {
            this.loadVrfTiersAndRuleGroups(this.selectedVrf);
          }
          this.getInitialTabIndex();
        },
      });
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
      this.currentTab = fallbackTab?.name || 'Application Profile';
      this.initialSubTab = null;
      return 0;
    } catch (error) {
      const errorFallbackTab = this.tabs[0];
      this.currentTab = errorFallbackTab?.name || 'Application Profile';
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
