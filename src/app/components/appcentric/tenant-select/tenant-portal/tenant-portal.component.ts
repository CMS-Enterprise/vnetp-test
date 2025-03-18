import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Datacenter, FirewallRuleGroup, GetManyTenantResponseDto, Tier, V2AppCentricTenantsService } from 'client';
import { Tab } from 'src/app/common/tabs/tabs.component';
import { ApplicationMode } from 'src/app/models/other/application-mode-enum';
import { V1DatacentersService } from 'client';
import { V1TiersService } from 'client';
import { TierContextService } from 'src/app/services/tier-context.service';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';

const tabs = [
  { name: 'Application Profile', route: ['application-profile'] },
  { name: 'Endpoint Group', route: ['endpoint-group'] },
  { name: 'Bridge Domain', route: ['bridge-domain'] },
  { name: 'Contract', route: ['contract'] },
  { name: 'Filter', route: ['filter'] },
  { name: 'L3 Outs', route: ['l3-outs'] },
  { name: 'VRF', route: ['vrf'] },
  { name: 'Route Profile', route: ['route-profile'] },
  { name: 'East/West Firewall', route: ['east-west-firewall'] },
  { name: 'North/South Firewall', route: ['north-south-firewall'] },
];

@Component({
  selector: 'app-tenant-portal',
  templateUrl: './tenant-portal.component.html',
})
export class TenantPortalComponent implements OnInit {
  public initialTabIndex = 0;
  public currentTab: string;
  public tenants: GetManyTenantResponseDto;
  public currentTenantName: string;
  public tenantId: string;
  public mode: ApplicationMode;
  public networkServicesContainerDatacenter: Datacenter;
  public networkServicesContainerNsTier: Tier;
  public networkServicesContainerEwTier: Tier;
  public networkServicesContainerEwFirewallRuleGroup: FirewallRuleGroup;
  public networkServicesContainerNsFirewallRuleGroup: FirewallRuleGroup;

  public tabs: Tab[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private tenantService: V2AppCentricTenantsService,
    private datacenterService: V1DatacentersService,
    private tierService: V1TiersService,
    private tierContextService: TierContextService,
    private datacenterContextService: DatacenterContextService,
  ) {
    // get tenantId in URL snapshot
    const match = this.router.routerState.snapshot.url.match(
      /tenant-select\/edit\/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}/,
    );
    if (match) {
      const uuid = match[0].split('/')[2];
      this.tenantId = uuid;
    }

    // Access the route data to get the mode
    this.activatedRoute.data.subscribe(data => {
      this.mode = data.mode;
      // Initialize tabs based on mode
      this.initializeTabs();
    });
  }

  private initializeTabs(): void {
    if (this.mode === ApplicationMode.TENANTV2) {
      // Show all tabs including firewalls for V2
      this.tabs = tabs.map(t => ({ name: t.name }));
    } else {
      // Filter out firewall tabs for non-V2
      this.tabs = tabs.filter(t => t.name !== 'East/West Firewall' && t.name !== 'North/South Firewall').map(t => ({ name: t.name }));
    }
  }

  public async handleTabChange(tab: Tab): Promise<any> {
    this.currentTab = tab.name;
    const tabRoute = tabs.find(t => t.name === tab.name);

    if (tab.name === 'East/West Firewall') {
      if (this.networkServicesContainerEwFirewallRuleGroup?.id) {
        this.tierContextService.unlockTier();
        this.tierContextService.switchTier(this.networkServicesContainerEwFirewallRuleGroup.id);
        this.tierContextService.lockTier();
        this.router.navigate(
          [{ outlets: { 'tenant-portal': ['east-west-firewall', 'edit', this.networkServicesContainerEwFirewallRuleGroup.id] } }],
          {
            queryParamsHandling: 'merge',
            relativeTo: this.activatedRoute,
          },
        );
      } else {
        // Handle case where firewall rule group is not yet loaded
        this.router.navigate([{ outlets: { 'tenant-portal': ['east-west-firewall'] } }], {
          queryParamsHandling: 'merge',
          relativeTo: this.activatedRoute,
        });
      }
    } else if (tab.name === 'North/South Firewall') {
      if (this.networkServicesContainerNsFirewallRuleGroup?.id) {
        this.tierContextService.unlockTier();
        this.tierContextService.switchTier(this.networkServicesContainerNsFirewallRuleGroup.id);
        this.tierContextService.lockTier();
        this.router.navigate(
          [{ outlets: { 'tenant-portal': ['north-south-firewall', 'edit', this.networkServicesContainerNsFirewallRuleGroup.id] } }],
          {
            queryParamsHandling: 'merge',
            relativeTo: this.activatedRoute,
          },
        );
      } else {
        // Handle case where firewall rule group is not yet loaded
        this.router.navigate([{ outlets: { 'tenant-portal': ['north-south-firewall'] } }], {
          queryParamsHandling: 'merge',
          relativeTo: this.activatedRoute,
        });
      }
    } else {
      this.router.navigate([{ outlets: { 'tenant-portal': tabRoute.route } }], {
        queryParamsHandling: 'merge',
        relativeTo: this.activatedRoute,
      });
    }
  }

  public getTenants(): void {
    this.tenantService
      .getOneTenant({
        id: this.tenantId,
      })
      .subscribe(
        response => {
          this.currentTenantName = response.name;

          if (this.mode === ApplicationMode.TENANTV2 && response.tenantVersion === 2) {
            this.getNetworkServicesContainerDatacenter(response.datacenterId);
          } else {
            throw new Error('Tenant is not in TenantV2 mode');
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
          join: ['firewallRuleGroups'],
          page: 1,
          perPage: 10,
        })
        .subscribe(tierResponse => {
          const nsTier = tierResponse.data.find(t => t.name === 'ns_fw_svc_tier');
          const ewTier = tierResponse.data.find(t => t.name === 'ew_fw_svc_tier');

          this.networkServicesContainerNsFirewallRuleGroup = nsTier?.firewallRuleGroups?.[0];
          this.networkServicesContainerEwFirewallRuleGroup = ewTier?.firewallRuleGroups?.[0];

          // Only call getInitialTabIndex if we have the necessary data
          if (this.networkServicesContainerNsFirewallRuleGroup || this.networkServicesContainerEwFirewallRuleGroup) {
            this.getInitialTabIndex();
          }
        });
    });
  }

  ngOnInit(): void {
    this.initialTabIndex = this.getInitialTabIndex();
    this.getTenants();
  }

  public getInitialTabIndex(): number {
    const regex = /\(tenant-portal:([\w\/-]+)\)/g;
    const page = regex.exec(this.router.url);

    // Default to first tab if no match
    if (!page || !page[1]) {
      this.currentTab = tabs[0].name;
      return 0;
    }

    // Extract the route path
    const currentPath = page[1];

    // Find matching tab by checking if the route is included in the path
    const tab = tabs.find(t => currentPath.includes(t.route[0]));

    // If no matching tab found or if it's a firewall tab, default to first tab
    if (!tab || tab.name === 'East/West Firewall' || tab.name === 'North/South Firewall') {
      this.currentTab = tabs[0].name;
      // If it was a firewall tab, navigate to the first tab
      if (tab?.name === 'East/West Firewall' || tab?.name === 'North/South Firewall') {
        this.router.navigate([{ outlets: { 'tenant-portal': tabs[0].route } }], {
          queryParamsHandling: 'merge',
          relativeTo: this.activatedRoute,
        });
      }
      return 0;
    }

    this.currentTab = tab.name;
    return tabs.findIndex(t => t.name === tab.name);
  }
}
