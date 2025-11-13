import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirewallConfigResolvedData, FirewallConfigType } from './firewall-config.resolver';
import { Tab } from 'src/app/common/tabs/tabs.component';

@Component({
  selector: 'app-firewall-config-container',
  templateUrl: './firewall-config.component.html',
  styleUrls: ['./firewall-config.component.scss'],
})
export class FirewallConfigComponent {
  tabs: Tab[] = [];

  hasSelection = false;
  public resolvedData: FirewallConfigResolvedData | null = null;
  public firewallName: string;
  public firewallType: FirewallConfigType;

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(data => {
      this.resolvedData = data?.firewall as FirewallConfigResolvedData;
      this.firewallName = this.resolvedData?.firewall?.name;
      this.firewallType = this.resolvedData?.firewallType;

      console.log('resolvedData', this.resolvedData);

      const allTabs = [
        { name: 'Firewall Rules', route: ['rules'] },
        { name: 'NAT Rules', route: ['nat'] },
        { name: 'Network Objects', route: ['network-objects'] },
        { name: 'Service Objects', route: ['service-objects'] },
      ];
      console.log('firewallType', this.firewallType);
      if (this.firewallType === 'service-graph-firewall') {
        this.tabs = allTabs.filter(tab => tab.name !== 'NAT Rules');
      } else {
        this.tabs = allTabs;
      }
    });
  }
}
