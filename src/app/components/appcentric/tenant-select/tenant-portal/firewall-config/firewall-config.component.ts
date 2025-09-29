import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirewallConfigResolvedData } from './firewall-config.resolver';

@Component({
  selector: 'app-firewall-config-container',
  templateUrl: './firewall-config.component.html',
  styleUrls: ['./firewall-config.component.scss'],
})
export class FirewallConfigComponent {
  tabs = [
    { name: 'Firewall Rules', route: ['rules'], requiresSelection: true },
    { name: 'NAT Rules', route: ['nat'], requiresSelection: true },
    { name: 'Network Objects', route: ['network-objects'], requiresSelection: true },
    { name: 'Service Objects', route: ['service-objects'], requiresSelection: true },
  ];

  hasSelection = false;
  public resolvedData: FirewallConfigResolvedData | null = null;
  public firewallName: string;

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(data => {
      this.resolvedData = data?.firewall as FirewallConfigResolvedData;
      this.firewallName = this.resolvedData?.firewall?.name;
    });
  }
}
