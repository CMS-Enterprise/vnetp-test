import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Tab } from 'src/app/common/tabs/tabs.component';

const tabs = [
  { name: 'Application Profile', route: ['application-profile'] },
  { name: 'Bridge Domain', route: ['bridge-domain'] },
  { name: 'Contract', route: ['contract'] },
  { name: 'Filter', route: ['filter'] },
  { name: 'L3 Outs', route: ['l3-outs'] },
  { name: 'VRF', route: ['vrf'] },
];

@Component({
  selector: 'app-tenant-portal',
  templateUrl: './tenant-portal.component.html',
})
export class TenantPortalComponent implements OnInit {
  public initialTabIndex = 0;
  public currentTab: string;

  public tabs: Tab[] = tabs.map(t => {
    return { name: t.name };
  });

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  public async handleTabChange(tab: Tab): Promise<any> {
    this.currentTab = tab.name;
    const tabRoute = tabs.find(t => t.name === tab.name);
    this.router.navigate([{ outlets: { 'tenant-portal': tabRoute.route } }], {
      queryParamsHandling: 'merge',
      relativeTo: this.activatedRoute,
    });
  }

  ngOnInit(): void {
    this.initialTabIndex = this.getInitialTabIndex();
  }

  private getInitialTabIndex(): number {
    const regex = /\(tenant-portal:([\w\/-]+)\)/g;
    const page = regex.exec(this.router.url);
    if (!page || !page[1]) {
      return 0;
    }

    const tab = tabs.find(t => {
      return t.route.join('') === page[1];
    });
    this.currentTab = tab.name;
    return this.tabs.findIndex(t => t.name === tab.name);
  }
}
