import { Component, OnInit } from '@angular/core';
import { Subnet, SubnetResponse } from 'src/app/models/d42/subnet';
import { HelpersService } from 'src/app/services/helpers.service';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-deploy',
  templateUrl: './deploy.component.html',
})
export class DeployComponent implements OnInit {
  tabIndex: number;
  subnets: Array<Subnet>;

  constructor(
    private hs: HelpersService,
    private automationApiService: AutomationApiService,
    private auth: AuthService,
  ) {
    this.subnets = new Array<Subnet>();
  }

  ngOnInit() {
    this.tabIndex = 0;
    this.getSubnets();
  }

  getSubnets() {
    this.automationApiService.getSubnets().subscribe(data => {
      const subnetResponse = data as SubnetResponse;
      this.getUndeployedSubnets(subnetResponse.subnets);
    });
  }

  getPropertyLength(subnet: Subnet, propertyName: string) {
    const jsonFirewallRules = subnet.custom_fields.find(
      c => c.key === propertyName,
    );

    const firewallRules = JSON.parse(jsonFirewallRules.value);

    let length = 0;

    if (firewallRules != null) {
      length = firewallRules.length;
    }

    return length;
  }

  getUndeployedSubnets(subnets: Array<Subnet>) {
    const undeployedSubnets = [];

    subnets.forEach(subnet => {
      const deployedState = this.hs.getBooleanCustomField(subnet, 'deployed');
      if (!deployedState) {
        undeployedSubnets.push(subnet);
      }
    });

    this.subnets = undeployedSubnets;
  }

  deployAll() {
    this.deployNetwork();
  }

  deployNetwork() {
    // Deploy Subnets
    this.subnets.forEach(s => {
      this.deploySubnet(s);
    });
  }
  deploySolaris() {
    const extra_vars: { [k: string]: any } = {};
    extra_vars.customer_name = this.auth.currentUserValue.CustomerName;
    const body = { extra_vars };
    this.automationApiService
      .launchTemplate('deploy-solaris', body, true)
      .subscribe();
  }

  private deploySubnet(subnet: Subnet) {
    const extra_vars: { [k: string]: any } = {};
    extra_vars.subnet_id = subnet.subnet_id;

    const body = { extra_vars };

    this.automationApiService
      .launchTemplate('deploy-network', body, true)
      .subscribe();
  }
}
