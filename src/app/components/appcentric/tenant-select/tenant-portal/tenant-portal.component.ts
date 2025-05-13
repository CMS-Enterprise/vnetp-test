import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Datacenter, FirewallRuleGroup, GetManyTenantResponseDto, NatRuleGroup, Tier, V2AppCentricTenantsService } from 'client';
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
    name: 'East/West Firewall',
    tooltip: 'These firewall rules are applied between ESGs and EPGs that have defined contracts.',
    id: 'tv2-east-west-firewall',
    subTabs: [
      { name: 'Firewall Rules', route: ['east-west-firewall'], id: 'tv2-east-west-firewall-firewall-rules' },
      { name: 'NAT Rules', route: ['east-west-nat'], id: 'tv2-east-west-firewall-nat-rules' },
      { name: 'Service Objects', route: ['east-west-service-objects'], id: 'tv2-east-west-firewall-service-objects' },
    ],
  },
  {
    name: 'North/South Firewall',
    tooltip: 'These firewall rules are applied between the ACI environment and external networks.',
    id: 'tv2-north-south-firewall',
    subTabs: [
      { name: 'Firewall Rules', route: ['north-south-firewall'], id: 'tv2-north-south-firewall-firewall-rules' },
      { name: 'NAT Rules', route: ['north-south-nat'], id: 'tv2-north-south-firewall-nat-rules' },
      { name: 'Network Objects', route: ['north-south-network-objects'], id: 'tv2-north-south-firewall-network-objects' },
      { name: 'Service Objects', route: ['north-south-service-objects'], id: 'tv2-north-south-firewall-service-objects' },
    ],
  },
  {
    name: 'Endpoint Connectivity Utility',
    tooltip: 'This utility allows you to test the connectivity between endpoints.',
    id: 'tv2-endpoint-connectivity-utility',
    route: ['endpoint-connectivity-utility'],
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
  public currentTenantName: string;
  public tenantId: string;
  public mode: ApplicationMode;
  public networkServicesContainerDatacenter: Datacenter;
  public networkServicesContainerNsTier: Tier;
  public networkServicesContainerEwTier: Tier;
  public networkServicesContainerEwFirewallRuleGroup: FirewallRuleGroup;
  public networkServicesContainerNsFirewallRuleGroup: FirewallRuleGroup;
  public networkServicesContainerEwNatRuleGroup: NatRuleGroup;
  public networkServicesContainerNsNatRuleGroup: NatRuleGroup;

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
    if (this.mode === ApplicationMode.TENANTV2) {
      // Show all tabs including firewalls for V2, preserving subTabs
      this.tabs = [...tabs];
    } else {
      // Filter out tenant v2 tabs
      this.tabs = tabs.filter(t => !t?.id?.startsWith('tv2-'));
    }
    // Set a default current tab to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.currentTab = this.tabs[0]?.name || 'Application Profile';
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
      case 'East/West Firewall':
        // Preset the Tier to the East/West Tier
        if (this.networkServicesContainerEwTier?.id) {
          this.tierContextService.unlockTier();
          this.tierContextService.switchTier(this.networkServicesContainerEwTier.id);
          this.tierContextService.lockTier();
        }
        break;
      case 'North/South Firewall':
        // Preset the Tier to the North/South Tier
        if (this.networkServicesContainerNsTier?.id) {
          this.tierContextService.unlockTier();
          this.tierContextService.switchTier(this.networkServicesContainerNsTier.id);
          this.tierContextService.lockTier();
        }
        break;
      case 'Network Objects':
        if (parentTabName === 'North/South Firewall' || this.currentTab === 'North/South Firewall') {
          if (this.networkServicesContainerNsTier?.id) {
            this.tierContextService.unlockTier();
            this.tierContextService.switchTier(this.networkServicesContainerNsTier.id);
            this.tierContextService.lockTier();
            this.router.navigate([{ outlets: { 'tenant-portal': ['north-south-network-objects'] } }], {
              queryParamsHandling: 'merge',
              relativeTo: this.activatedRoute,
            });
          }
        }
        return;

      case 'Service Objects':
        // Check if we're under East/West or North/South based on parent tab context
        if (parentTabName === 'East/West Firewall' || this.currentTab === 'East/West Firewall') {
          if (this.networkServicesContainerEwTier?.id) {
            this.tierContextService.unlockTier();
            this.tierContextService.switchTier(this.networkServicesContainerEwTier.id);
            this.tierContextService.lockTier();
            this.router.navigate([{ outlets: { 'tenant-portal': ['east-west-service-objects'] } }], {
              queryParamsHandling: 'merge',
              relativeTo: this.activatedRoute,
            });
          }
        } else if (parentTabName === 'North/South Firewall' || this.currentTab === 'North/South Firewall') {
          if (this.networkServicesContainerNsTier?.id) {
            this.tierContextService.unlockTier();
            this.tierContextService.switchTier(this.networkServicesContainerNsTier.id);
            this.tierContextService.lockTier();
            this.router.navigate([{ outlets: { 'tenant-portal': ['north-south-service-objects'] } }], {
              queryParamsHandling: 'merge',
              relativeTo: this.activatedRoute,
            });
          }
        }
        return;

      case 'Firewall Rules':
        // Check if we're under East/West or North/South based on parent tab context
        if (parentTabName === 'East/West Firewall' || this.currentTab === 'East/West Firewall') {
          if (this.networkServicesContainerEwFirewallRuleGroup?.id && this.networkServicesContainerEwTier?.id) {
            this.tierContextService.unlockTier();
            this.tierContextService.switchTier(this.networkServicesContainerEwTier.id);
            this.tierContextService.lockTier();
            this.router.navigate(
              [{ outlets: { 'tenant-portal': ['east-west-firewall', 'edit', this.networkServicesContainerEwFirewallRuleGroup.id] } }],
              {
                queryParamsHandling: 'merge',
                relativeTo: this.activatedRoute,
              },
            );
          }
        } else if (parentTabName === 'North/South Firewall' || this.currentTab === 'North/South Firewall') {
          if (this.networkServicesContainerNsFirewallRuleGroup?.id && this.networkServicesContainerNsTier?.id) {
            this.tierContextService.unlockTier();
            this.tierContextService.switchTier(this.networkServicesContainerNsTier.id);
            this.tierContextService.lockTier();
            this.router.navigate(
              [{ outlets: { 'tenant-portal': ['north-south-firewall', 'edit', this.networkServicesContainerNsFirewallRuleGroup.id] } }],
              {
                queryParamsHandling: 'merge',
                relativeTo: this.activatedRoute,
              },
            );
          }
        }
        break;
      case 'NAT Rules':
        if (parentTabName === 'North/South Firewall' || this.currentTab === 'North/South Firewall') {
          if (this.networkServicesContainerNsNatRuleGroup?.id && this.networkServicesContainerNsTier?.id) {
            this.tierContextService.unlockTier();
            this.tierContextService.switchTier(this.networkServicesContainerNsTier.id);
            this.tierContextService.lockTier();
          }
          this.router.navigate(
            [{ outlets: { 'tenant-portal': ['north-south-nat', 'edit', this.networkServicesContainerNsNatRuleGroup.id] } }],
            {
              queryParamsHandling: 'merge',
              relativeTo: this.activatedRoute,
            },
          );
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
      })
      .subscribe(
        response => {
          this.currentTenantName = response.name;

          if (this.mode === ApplicationMode.TENANTV2 && response.tenantVersion === 2) {
            this.getNetworkServicesContainerDatacenter(response.datacenterId);
          }
        },
        () => {
          this.tenants = null;
        },
      );
  }

  public getNetworkServicesContainerDatacenter(datacenterId: string): void {
    this.datacenterService.getOneDatacenter({ id: datacenterId, join: ['tiers'] }).subscribe(response => {
      this.networkServicesContainerDatacenter = response;
      this.datacenterContextService.switchDatacenter(response.id);
      this.networkServicesContainerNsTier = response.tiers.find(t => t.name === 'ns_fw_svc_tier');
      this.networkServicesContainerEwTier = response.tiers.find(t => t.name === 'ew_fw_svc_tier');

      this.tierService
        .getManyTier({
          filter: [`datacenterId||eq||${datacenterId}`],
          join: ['firewallRuleGroups', 'natRuleGroups'],
          page: 1,
          perPage: 10,
        })
        .subscribe(tierResponse => {
          const nsTier = tierResponse.data.find(t => t.name === 'ns_fw_svc_tier');
          const ewTier = tierResponse.data.find(t => t.name === 'ew_fw_svc_tier');

          this.networkServicesContainerNsFirewallRuleGroup = nsTier?.firewallRuleGroups?.[0];
          this.networkServicesContainerEwFirewallRuleGroup = ewTier?.firewallRuleGroups?.[0];
          this.networkServicesContainerNsNatRuleGroup = nsTier?.natRuleGroups?.[0];
          this.networkServicesContainerEwNatRuleGroup = ewTier?.natRuleGroups?.[0];

          // Only call getInitialTabIndex if we have the necessary data
          if (this.networkServicesContainerNsFirewallRuleGroup || this.networkServicesContainerEwFirewallRuleGroup) {
            this.getInitialTabIndex();
          }
        });
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

    this.mode = RouteDataUtil.getApplicationModeFromRoute(this.activatedRoute);
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
      setTimeout(() => {
        this.tabsComponent.setActiveSubTab(this.initialSubTab);
      });
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

      // Find matching tab by checking if the route is included in the path
      // Handle both direct tab routes and sub-tab routes
      const matchingTab = tabs.find(t => {
        if (!t.route) {
          return false;
        }
        return currentPath.includes(t.route[0]);
      });
      // Also check for sub-tabs
      const matchingSubTab = tabs
        .filter(t => t.subTabs)
        .flatMap(t => t.subTabs || [])
        .find(st => {
          if (!st || !st.route || !st.route[0]) {
            return false;
          }
          return currentPath.includes(st.route[0]);
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
