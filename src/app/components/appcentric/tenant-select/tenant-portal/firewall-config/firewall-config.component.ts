import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-firewall-config-container',
  templateUrl: './firewall-config.component.html',
  styleUrls: ['./firewall-config.component.scss'],
})
export class FirewallConfigComponent {
  tabs = [
    { name: 'Summary', route: [], requiresSelection: false },
    { name: 'Firewall Rules', route: ['rules'], requiresSelection: true },
    { name: 'NAT Rules', route: ['nat'], requiresSelection: true },
    { name: 'Network Objects', route: ['network-objects'], requiresSelection: true },
    { name: 'Service Objects', route: ['service-objects'], requiresSelection: true },
  ];

  hasSelection = false;

  constructor(private route: ActivatedRoute) {
    this.route.paramMap.subscribe(params => {
      this.hasSelection = !!params.get('firewallId');
    });
  }
}
