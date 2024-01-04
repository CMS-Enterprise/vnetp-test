import { Component, OnInit, OnDestroy, ContentChild } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { Datacenter, Tier } from 'client';
import { TierContextService } from 'src/app/services/tier-context.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { Tab, TabsComponent } from 'src/app/common/tabs/tabs.component';
import { ActivatedRoute, Router } from '@angular/router';

const tabs = [
  { name: 'Virtual Servers', route: ['virtual-servers'] },
  { name: 'Pools', route: ['pools'] },
  { name: 'Pool Relations', route: ['pools', 'relations'] },
  { name: 'Nodes', route: ['nodes'] },
  { name: 'iRules', route: ['irules'] },
  { name: 'Health Monitors', route: ['health-monitors'] },
  { name: 'Profiles', route: ['profiles'] },
  { name: 'Policies', route: ['policies'] },
  { name: 'VLANs', route: ['vlans'] },
  { name: 'Self IPs', route: ['self-ips'] },
  { name: 'Routes', route: ['routes'] },
];

@Component({
  selector: 'app-load-balancers',
  templateUrl: './load-balancers.component.html',
})
export class LoadBalancersComponent implements OnInit, OnDestroy {
  @ContentChild('tabsRef') tabsRef: TabsComponent;

  public currentDatacenter: Datacenter;
  public currentTier: Tier;
  public initialTabIndex = 0;

  public tabs: Tab[] = tabs.map(t => ({ name: t.name }));

  private dataChanges: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private datacenterContextService: DatacenterContextService,
    private router: Router,
    private tierContextService: TierContextService,
  ) {}

  public handleTabChange(tab: Tab): void {
    if (!this.currentDatacenter || !this.currentTier) {
      return;
    }

    const tabRoute = tabs.find(t => t.name === tab.name);
    this.router.navigate([{ outlets: { 'load-balancer': tabRoute.route } }], {
      queryParamsHandling: 'merge',
      relativeTo: this.activatedRoute,
    });
  }

  private subscribeToDataChanges(): Subscription {
    const datacenter$ = this.datacenterContextService.currentDatacenter;
    const tier$ = this.tierContextService.currentTier;

    return combineLatest([datacenter$, tier$]).subscribe(data => {
      const [datacenter, tier] = data;
      this.currentDatacenter = datacenter;
      this.currentTier = tier;
    });
  }

  ngOnInit() {
    this.dataChanges = this.subscribeToDataChanges();
    this.initialTabIndex = this.getInitialTabIndex();
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.dataChanges]);
  }

  private getInitialTabIndex(): number {
    const regex = /\(load-balancer:([\w\/-]+)\)/g;
    const page = regex.exec(this.router.url);
    if (!page || !page[1]) {
      return 0;
    }

    const tab = tabs.find(t => t.route.join('') === page[1]);
    return this.tabs.findIndex(t => t.name === tab.name);
  }
}
