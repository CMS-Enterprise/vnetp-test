import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GetManyTenantResponseDto, V2AppCentricTenantsService, Tenant } from 'client';
import { Tab, TabsComponent } from 'src/app/common/tabs/tabs.component';
import { ApplicationMode } from 'src/app/models/other/application-mode-enum';
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

  // Loading states
  public isLoadingTenant = false;
  public isLoadingVrfData = false;
  public isLoadingTiers = false;

  public tabs: Tab[] = [];

  // Subscription management
  private destroy$ = new Subject<void>();
  private subscriptions: Subscription[] = [];

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private tenantService: V2AppCentricTenantsService) {}

  private initializeTabs(): void {
    if (this.applicationMode === ApplicationMode.TENANTV2) {
      // Show all tabs including firewalls for V2, preserving subTabs
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

  public async handleTabChange(tab: Tab): Promise<any> {
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
        },
        () => {
          this.tenants = null;
          this.isLoadingTenant = false;
        },
      );
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
