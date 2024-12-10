import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GetManyTenantResponseDto, V2AppCentricTenantsService } from 'client';
import { Tab } from 'src/app/common/tabs/tabs.component';

const tabs = [
  { name: 'Application Profile', route: ['application-profile'] },
  { name: 'Endpoint Group', route: ['endpoint-group'] },
  { name: 'Bridge Domain', route: ['bridge-domain'] },
  { name: 'Contract', route: ['contract'] },
  { name: 'Filter', route: ['filter'] },
  { name: 'L3 Outs', route: ['l3-outs'] },
  { name: 'VRF', route: ['vrf'] },
  { name: 'Route Profile', route: ['route-profile'] },
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

  public tabs: Tab[] = tabs.map(t => ({ name: t.name }));

  constructor(public activatedRoute: ActivatedRoute, private router: Router, private tenantService: V2AppCentricTenantsService) {
    // get tenantId in URL snapshot
    const match = this.router.routerState.snapshot.url.match(
      /tenant-select\/edit\/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}/,
    );
    if (match) {
      const uuid = match[0].split('/')[2];
      this.tenantId = uuid;
    }
  }

  public async handleTabChange(tab: Tab): Promise<any> {
    this.currentTab = tab.name;
    const tabRoute = tabs.find(t => t.name === tab.name);
    this.router.navigate([{ outlets: { 'tenant-portal': tabRoute.route } }], {
      queryParamsHandling: 'merge',
      relativeTo: this.activatedRoute,
    });
  }

  public getTenants(): void {
    this.tenantService
      .getManyTenant({
        page: 1,
        perPage: 500,
      })
      .subscribe(
        data => {
          this.tenants = data;

          // match this.tenantId with list of currentTenants to get the tenantName
          this.currentTenantName = this.tenants.data.find(ten => ten.id === this.tenantId).name;
        },
        () => {
          this.tenants = null;
        },
      );
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
