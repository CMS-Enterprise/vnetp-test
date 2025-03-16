import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Datacenter, FirewallRuleGroup, GetManyTenantResponseDto, Tier, V2AppCentricTenantsService } from 'client';
import { Tab } from 'src/app/common/tabs/tabs.component';
import { applicationMode } from 'src/app/models/other/application-mode-enum';
import { V1DatacentersService } from 'client';
import { V1TiersService } from 'client';

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
  public mode: applicationMode;
  public networkServicesContainerDatacenter: Datacenter;
  public networkServicesContainerNsTier: Tier;
  public networkServicesContainerEwTier: Tier;
  public networkServicesContainerEwFirewallRuleGroup: FirewallRuleGroup;
  public networkServicesContainerNsFirewallRuleGroup: FirewallRuleGroup;

  public tabs: Tab[] = tabs.map(t => ({ name: t.name }));

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private tenantService: V2AppCentricTenantsService,
    private datacenterService: V1DatacentersService,
    private tierService: V1TiersService,
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
      console.log('Application mode:', this.mode);
    });
  }

  public async handleTabChange(tab: Tab): Promise<any> {
    this.currentTab = tab.name;
    const tabRoute = tabs.find(t => t.name === tab.name);
    // TODO: Not switching properly to the correct firewall rule group.
    if (tab.name === 'East/West Firewall' && this.networkServicesContainerEwFirewallRuleGroup) {
      this.router.navigate(
        [{ outlets: { 'tenant-portal': ['east-west-firewall', 'edit', this.networkServicesContainerEwFirewallRuleGroup.id] } }],
        {
          queryParamsHandling: 'merge',
          relativeTo: this.activatedRoute,
        },
      );
    } else if (tab.name === 'North/South Firewall' && this.networkServicesContainerNsFirewallRuleGroup) {
      this.router.navigate(
        [{ outlets: { 'tenant-portal': ['east-west-firewall', 'edit', this.networkServicesContainerNsFirewallRuleGroup.id] } }],
        {
          queryParamsHandling: 'merge',
          relativeTo: this.activatedRoute,
        },
      );
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

          if (this.mode === applicationMode.TENANTV2 && response.tenantVersion === 2) {
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
      this.networkServicesContainerNsTier = response.tiers.find(t => t.name === 'ew_fw_svc_tier');
      this.networkServicesContainerEwTier = response.tiers.find(t => t.name === 'ns_fw_svc_tier');

      this.tierService.getOneTier({ id: this.networkServicesContainerNsTier.id, join: ['firewallRuleGroups'] }).subscribe(nsResponse => {
        this.networkServicesContainerNsFirewallRuleGroup = nsResponse.firewallRuleGroups[0];
      });

      this.tierService.getOneTier({ id: this.networkServicesContainerEwTier.id, join: ['firewallRuleGroups'] }).subscribe(eWresponse => {
        this.networkServicesContainerEwFirewallRuleGroup = eWresponse.firewallRuleGroups[0];
      });
    });
  }

  ngOnInit(): void {
    this.getTenants();
    this.initialTabIndex = this.getInitialTabIndex();
  }

  public getInitialTabIndex(): number {
    const regex = /\(tenant-portal:([\w\/-]+)\)/g;
    const page = regex.exec(this.router.url);
    if (!page || !page[1]) {
      this.currentTab = this.tabs[0].name;
      return 0;
    }
    const tab = tabs.find(t => t.route.join('') === page[1]);
    this.currentTab = tab.name;
    return this.tabs.findIndex(t => t.name === tab.name);
  }
}
