import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Datacenter,
  FirewallRuleGroup,
  GetManyTenantResponseDto,
  NatRuleGroup,
  Tier,
  V2AppCentricTenantsService,
  Vrf,
  Tenant
} from 'client';
import { Tab, TabsComponent } from 'src/app/common/tabs/tabs.component';
import { ApplicationMode } from 'src/app/models/other/application-mode-enum';
import { V1DatacentersService } from 'client';
import { V1TiersService } from 'client';
import { TierContextService } from 'src/app/services/tier-context.service';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { RouteDataUtil } from '../../../../utils/route-data.util';

const tabs: Tab[] = [
  { name: 'Application Profile', route: ['application-profile'] },
  { name: 'Endpoint Group', route: ['endpoint-group'] },
  { name: 'Endpoint Security Group', route: ['endpoint-security-group'] },
  { name: 'Bridge Domain', route: ['bridge-domain'] },
  { name: 'Contract', route: ['contract'] },
  { name: 'Filter', route: ['filter'] },
  { name: 'L3 Outs', route: ['l3-outs'] },
  { name: 'VRF', route: ['vrf'] },
  { name: 'Route Profile', route: ['route-profile'] },
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
export class TenantPortalComponent implements OnInit, AfterViewInit {
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

  // VRF-based properties
  public tenantVrfs: Vrf[] = [];
  public selectedVrf: Vrf | null = null;
  public selectedVrfInternalTier: Tier;
  public selectedVrfExternalTier: Tier;
  public selectedVrfInternalFirewallRuleGroup: FirewallRuleGroup | null = null;
  public selectedVrfExternalFirewallRuleGroup: FirewallRuleGroup | null = null;
  public selectedVrfInternalNatRuleGroup: NatRuleGroup | null = null;
  public selectedVrfExternalNatRuleGroup: NatRuleGroup | null = null;

  public tabs: Tab[] = [];

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
      this.tabs = [...tabs];
    } else {
      // Filter out tenant v2 tabs
      this.tabs = tabs.filter(t => !t?.id?.startsWith('tv2-'));
    }
    // Set a default current tab to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.currentTab = this.tabs[0]?.name || 'Application Profile';
  }

  /**
   * Select a VRF and load its associated tiers and rule groups
   */
  public selectVrf(vrf: Vrf): void {
    this.selectedVrf = vrf;
    this.loadVrfTiersAndRuleGroups(vrf);
  }

  /**
   * Load tiers and rule groups for the selected VRF
   */
  private loadVrfTiersAndRuleGroups(vrf: Vrf): void {
    this.selectedVrfInternalTier = vrf.internalNetworkServicesTier;
    this.selectedVrfExternalTier = vrf.externalNetworkServicesTier;

    // If we have tier IDs but not the full tier objects with rule groups, fetch them
    if (this.selectedVrfInternalTier?.id || this.selectedVrfExternalTier?.id) {
      const tierIds = [
        this.selectedVrfInternalTier?.id,
        this.selectedVrfExternalTier?.id
      ].filter(Boolean);

      if (tierIds.length > 0) {
        // Get the full tier objects with rule groups
        this.tierService
          .getManyTier({
            filter: tierIds.map(id => `id||eq||${id}`),
            join: ['firewallRuleGroups', 'natRuleGroups'],
            page: 1,
            perPage: 10
          })
          .subscribe(tierResponse => {
            const tiersById = new Map(tierResponse.data.map(t => [t.id, t]));

            if (this.selectedVrfInternalTier?.id) {
              const fullInternalTier = tiersById.get(this.selectedVrfInternalTier.id);
              if (fullInternalTier) {
                this.selectedVrfInternalTier = fullInternalTier;
                this.selectedVrfInternalFirewallRuleGroup = fullInternalTier.firewallRuleGroups?.[0] || null;
                this.selectedVrfInternalNatRuleGroup = fullInternalTier.natRuleGroups?.[0] || null;
              }
            }

            if (this.selectedVrfExternalTier?.id) {
              const fullExternalTier = tiersById.get(this.selectedVrfExternalTier.id);
              if (fullExternalTier) {
                this.selectedVrfExternalTier = fullExternalTier;
                this.selectedVrfExternalFirewallRuleGroup = fullExternalTier.firewallRuleGroups?.[0] || null;
                this.selectedVrfExternalNatRuleGroup = fullExternalTier.natRuleGroups?.[0] || null;
              }
            }

            // After rule groups are loaded, re-trigger current subtab navigation
            this.retriggerCurrentSubtab();
          });
      }
    } else {
      // If no additional loading needed, still check for navigation
      this.retriggerCurrentSubtab();
    }
  }

  /**
   * Re-trigger the current subtab to navigate to the new VRF's rule group
   */
  private retriggerCurrentSubtab(): void {
    const currentUrl = this.router.url;
    console.log('retriggerCurrentSubtab - currentUrl:', currentUrl);
    console.log('Internal RG:', this.selectedVrfInternalFirewallRuleGroup?.id);
    console.log('External RG:', this.selectedVrfExternalFirewallRuleGroup?.id);
    console.log('Internal Tier:', this.selectedVrfInternalTier?.id);
    console.log('External Tier:', this.selectedVrfExternalTier?.id);

    // Force navigation to new rule group directly instead of using handleTabChange
    if (currentUrl.includes('internal-firewall/edit/')) {
      if (this.selectedVrfInternalFirewallRuleGroup?.id && this.selectedVrfInternalTier?.id) {
        console.log('Navigating to internal firewall:', this.selectedVrfInternalFirewallRuleGroup.id);
        this.tierContextService.unlockTier();
        this.tierContextService.switchTier(this.selectedVrfInternalTier.id);
        this.tierContextService.lockTier();
        this.router.navigate(
          [{ outlets: { 'tenant-portal': ['internal-firewall', 'edit', this.selectedVrfInternalFirewallRuleGroup.id] } }],
          {
            queryParamsHandling: 'merge',
            relativeTo: this.activatedRoute,
          },
        );
      }
    } else if (currentUrl.includes('external-firewall/edit/')) {
      if (this.selectedVrfExternalFirewallRuleGroup?.id && this.selectedVrfExternalTier?.id) {
        console.log('Navigating to external firewall:', this.selectedVrfExternalFirewallRuleGroup.id);
        this.tierContextService.unlockTier();
        this.tierContextService.switchTier(this.selectedVrfExternalTier.id);
        this.tierContextService.lockTier();
        this.router.navigate(
          [{ outlets: { 'tenant-portal': ['external-firewall', 'edit', this.selectedVrfExternalFirewallRuleGroup.id] } }],
          {
            queryParamsHandling: 'merge',
            relativeTo: this.activatedRoute,
          },
        );
      }
    } else if (currentUrl.includes('internal-nat/edit/')) {
      if (this.selectedVrfInternalNatRuleGroup?.id && this.selectedVrfInternalTier?.id) {
        console.log('Navigating to internal NAT:', this.selectedVrfInternalNatRuleGroup.id);
        this.tierContextService.unlockTier();
        this.tierContextService.switchTier(this.selectedVrfInternalTier.id);
        this.tierContextService.lockTier();
        this.router.navigate(
          [{ outlets: { 'tenant-portal': ['internal-nat', 'edit', this.selectedVrfInternalNatRuleGroup.id] } }],
          {
            queryParamsHandling: 'merge',
            relativeTo: this.activatedRoute,
          },
        );
      }
    } else if (currentUrl.includes('external-nat/edit/')) {
      if (this.selectedVrfExternalNatRuleGroup?.id && this.selectedVrfExternalTier?.id) {
        console.log('Navigating to external NAT:', this.selectedVrfExternalNatRuleGroup.id);
        this.tierContextService.unlockTier();
        this.tierContextService.switchTier(this.selectedVrfExternalTier.id);
        this.tierContextService.lockTier();
        this.router.navigate(
          [{ outlets: { 'tenant-portal': ['external-nat', 'edit', this.selectedVrfExternalNatRuleGroup.id] } }],
          {
            queryParamsHandling: 'merge',
            relativeTo: this.activatedRoute,
          },
        );
      }
    }
  }

  public async handleTabChange(tab: Tab): Promise<any> {
    if (!tab) {
      return;
    }

    // Store the parent tab name if this is a sub-tab
    const parentTabName = this.currentTab;

    // Update current tab unless this is a sub-tab
    if (!tab.isSubTab) {
      this.currentTab = tab.name;
    }

    // Use the name of the tab to determine the action to take
    switch (tab.name) {
      case 'Internal Firewall':
        // Preset the Tier to the Internal Tier of selected VRF
        if (this.selectedVrfInternalTier?.id) {
          this.tierContextService.unlockTier();
          this.tierContextService.switchTier(this.selectedVrfInternalTier.id);
          this.tierContextService.lockTier();
        }
        break;
      case 'External Firewall':
        // Preset the Tier to the External Tier of selected VRF
        if (this.selectedVrfExternalTier?.id) {
          this.tierContextService.unlockTier();
          this.tierContextService.switchTier(this.selectedVrfExternalTier.id);
          this.tierContextService.lockTier();
        }
        break;
      case 'Network Objects':
        if (parentTabName === 'External Firewall' || this.currentTab === 'External Firewall') {
          if (this.selectedVrfExternalTier?.id) {
            this.tierContextService.unlockTier();
            this.tierContextService.switchTier(this.selectedVrfExternalTier.id);
            this.tierContextService.lockTier();
            this.router.navigate([{ outlets: { 'tenant-portal': ['external-network-objects'] } }], {
              queryParamsHandling: 'merge',
              relativeTo: this.activatedRoute,
            });
          }
        }
        return;

      case 'Service Objects':
        // Check if we're under Internal or External based on parent tab context
        if (parentTabName === 'Internal Firewall' || this.currentTab === 'Internal Firewall') {
          if (this.selectedVrfInternalTier?.id) {
            this.tierContextService.unlockTier();
            this.tierContextService.switchTier(this.selectedVrfInternalTier.id);
            this.tierContextService.lockTier();
            this.router.navigate([{ outlets: { 'tenant-portal': ['internal-service-objects'] } }], {
              queryParamsHandling: 'merge',
              relativeTo: this.activatedRoute,
            });
          }
        } else if (parentTabName === 'External Firewall' || this.currentTab === 'External Firewall') {
          if (this.selectedVrfExternalTier?.id) {
            this.tierContextService.unlockTier();
            this.tierContextService.switchTier(this.selectedVrfExternalTier.id);
            this.tierContextService.lockTier();
            this.router.navigate([{ outlets: { 'tenant-portal': ['external-service-objects'] } }], {
              queryParamsHandling: 'merge',
              relativeTo: this.activatedRoute,
            });
          }
        }
        return;

      case 'Firewall Rules':
        // Check if we're under Internal or External based on parent tab context
        if (parentTabName === 'Internal Firewall' || this.currentTab === 'Internal Firewall') {
          if (this.selectedVrfInternalFirewallRuleGroup?.id && this.selectedVrfInternalTier?.id) {
            this.tierContextService.unlockTier();
            this.tierContextService.switchTier(this.selectedVrfInternalTier.id);
            this.tierContextService.lockTier();
            this.router.navigate(
              [{ outlets: { 'tenant-portal': ['internal-firewall', 'edit', this.selectedVrfInternalFirewallRuleGroup.id] } }],
              {
                queryParamsHandling: 'merge',
                relativeTo: this.activatedRoute,
              },
            );
          }
        } else if (parentTabName === 'External Firewall' || this.currentTab === 'External Firewall') {
          if (this.selectedVrfExternalFirewallRuleGroup?.id && this.selectedVrfExternalTier?.id) {
            this.tierContextService.unlockTier();
            this.tierContextService.switchTier(this.selectedVrfExternalTier.id);
            this.tierContextService.lockTier();
            this.router.navigate(
              [{ outlets: { 'tenant-portal': ['external-firewall', 'edit', this.selectedVrfExternalFirewallRuleGroup.id] } }],
              {
                queryParamsHandling: 'merge',
                relativeTo: this.activatedRoute,
              },
            );
          }
        }
        break;
      case 'NAT Rules':
        if (parentTabName === 'Internal Firewall' || this.currentTab === 'Internal Firewall') {
          if (this.selectedVrfInternalNatRuleGroup?.id && this.selectedVrfInternalTier?.id) {
            this.tierContextService.unlockTier();
            this.tierContextService.switchTier(this.selectedVrfInternalTier.id);
            this.tierContextService.lockTier();
            this.router.navigate(
              [{ outlets: { 'tenant-portal': ['internal-nat', 'edit', this.selectedVrfInternalNatRuleGroup.id] } }],
              {
                queryParamsHandling: 'merge',
                relativeTo: this.activatedRoute,
              },
            );
          }
        } else if (parentTabName === 'External Firewall' || this.currentTab === 'External Firewall') {
          if (this.selectedVrfExternalNatRuleGroup?.id && this.selectedVrfExternalTier?.id) {
            this.tierContextService.unlockTier();
            this.tierContextService.switchTier(this.selectedVrfExternalTier.id);
            this.tierContextService.lockTier();
            this.router.navigate(
              [{ outlets: { 'tenant-portal': ['external-nat', 'edit', this.selectedVrfExternalNatRuleGroup.id] } }],
              {
                queryParamsHandling: 'merge',
                relativeTo: this.activatedRoute,
              },
            );
          }
        }
        break;

      default:
        // For any other tab, look up its route and navigate
        const routeTab = tabs.find(t => t.name === tab.name);
        if (routeTab?.route) {
          this.router.navigate([{ outlets: { 'tenant-portal': routeTab.route } }], {
            queryParamsHandling: 'merge',
            relativeTo: this.activatedRoute,
          });
        } else if (tab.route) {
          // If we couldn't find it in the tabs array but it has a route, use that
          this.router.navigate([{ outlets: { 'tenant-portal': tab.route } }], {
            queryParamsHandling: 'merge',
            relativeTo: this.activatedRoute,
          });
        }
        break;
    }
  }

  public getTenant(): void {
    this.tenantService
      .getOneTenant({
        id: this.tenantId,
        join: [
          'vrfs',
          'vrfs.internalNetworkServicesTier',
          'vrfs.internalNetworkServicesTier.firewallRuleGroups',
          'vrfs.internalNetworkServicesTier.natRuleGroups',
          // 'vrfs.externalNetworkServicesTier',
          // 'vrfs.externalNetworkServicesTier.firewallRuleGroups',
          // 'vrfs.externalNetworkServicesTier.natRuleGroups'
        ]
      })
      .subscribe(
        response => {
          this.currentTenant = response;
          this.currentTenantName = response.name;

          if (this.applicationMode === ApplicationMode.TENANTV2 && response.tenantVersion === 2) {
            this.tenantVrfs = response.vrfs || [];
            console.log('tenantVrfs', this.tenantVrfs);
            this.initializeVrfSelection();
            this.getNetworkServicesContainerDatacenter(response.datacenterId);
          }
        },
        () => {
          this.tenants = null;
        },
      );
  }

  /**
   * Initialize VRF selection - select first VRF or only VRF if there's only one
   */
  private initializeVrfSelection(): void {
    if (this.tenantVrfs && this.tenantVrfs.length > 0) {
      // If there's only one VRF or if no VRF is selected yet, select the first one
      if (this.tenantVrfs.length === 1 || !this.selectedVrf) {
        this.selectVrf(this.tenantVrfs[0]);
      }
    }
  }

  public getNetworkServicesContainerDatacenter(datacenterId: string): void {
    this.datacenterService.getOneDatacenter({ id: datacenterId, join: ['tiers'] }).subscribe(response => {
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
      const regex = /\(tenant-portal:([\w\/-]+)\)/g;
      const page = regex.exec(this.router.url);

      // Default to first tab if no match
      if (!page || !page[1]) {
        this.currentTab = this.tabs[0]?.name || 'Application Profile';
        return 0;
      }

      // Extract the route path
      const currentPath = page[1];

      // Update route matching for new firewall names
      let adjustedPath = currentPath;
      // Map old routes to new routes
      adjustedPath = adjustedPath.replace(/east-west-/g, 'internal-');
      adjustedPath = adjustedPath.replace(/north-south-/g, 'external-');

      // Find matching tab by checking if the route is included in the path
      // Handle both direct tab routes and sub-tab routes
      const matchingTab = tabs.find(t => {
        if (!t.route) {
          return false;
        }
        return adjustedPath.includes(t.route[0]);
      });
      // Also check for sub-tabs
      const matchingSubTab = tabs
        .filter(t => t.subTabs)
        .flatMap(t => t.subTabs || [])
        .find(st => {
          if (!st || !st.route || !st.route[0]) {
            return false;
          }
          return adjustedPath.includes(st.route[0]);
        });

      if (matchingSubTab) {
        // If we found a matching sub-tab, set the parent tab as active
        const parentTab = tabs.find(t => t.subTabs && t.subTabs.some(st => st.name === matchingSubTab.name));
        if (parentTab) {
          this.currentTab = parentTab.name;
          // Store the matching sub-tab for selection after view init
          this.initialSubTab = matchingSubTab;

          return tabs.findIndex(t => t.name === parentTab.name);
        }
      }

      // If no matching tab found, default to first tab
      if (!matchingTab) {
        this.currentTab = this.tabs[0]?.name || 'Application Profile';
        return 0;
      }

      this.currentTab = matchingTab.name;
      return tabs.findIndex(t => t.name === matchingTab.name);
    } catch (error) {
      console.error('Error in getInitialTabIndex:', error);
      this.currentTab = this.tabs[0]?.name || 'Application Profile';
      return 0;
    }
  }
}
