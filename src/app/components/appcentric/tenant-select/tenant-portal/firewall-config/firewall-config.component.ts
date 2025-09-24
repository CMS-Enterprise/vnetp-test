import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-firewall-config',
  templateUrl: './firewall-config.component.html',
  styleUrls: ['./firewall-config.component.css'],
})
export class FirewallConfigComponent implements OnInit {
  public firewallType = '';
  public firewallId = '';
  public firewallName = '';
  public serviceGraphId = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.firewallType = params.type || 'unknown';
      this.firewallId = params.firewallId || '';
      this.firewallName = params.firewallName || '';
      this.serviceGraphId = params.serviceGraphId || '';
    });
  }
}
