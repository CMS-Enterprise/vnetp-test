import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirewallConfigResolvedData } from './firewall-config.resolver';

@Component({
  selector: 'app-firewall-config-summary',
  templateUrl: './firewall-config-summary.component.html',
})
export class FirewallConfigSummaryComponent implements OnInit {
  public resolvedData: FirewallConfigResolvedData | null = null;

  public get hasFirewall(): boolean {
    return !!this.resolvedData?.firewall;
  }

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.resolvedData = data?.firewall as FirewallConfigResolvedData;
    });
  }
}
