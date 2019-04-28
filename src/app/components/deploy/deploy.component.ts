import { Component, OnInit } from '@angular/core';
import { Subnet, SubnetResponse } from 'src/app/models/d42/subnet';
import { HelpersService } from 'src/app/services/helpers.service';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { IpAddressService } from 'src/app/services/ip-address.service';

@Component({
  selector: 'app-deploy',
  templateUrl: './deploy.component.html',
  styleUrls: ['./deploy.component.css']
})
export class DeployComponent implements OnInit {

  tabIndex: number;
  subnets: Array<Subnet>;

  constructor(private hs: HelpersService, private automationApiService: AutomationApiService, private ips: IpAddressService) {
    this.subnets = new Array<Subnet>();
   }

  ngOnInit() {
    this.tabIndex = 0;
    this.getSubnets();
  }

  getSubnets() {
    this.automationApiService.getSubnets()
    .subscribe(data => {
      const subnetResponse = data as SubnetResponse;
      this.getUndeployedSubnets(subnetResponse.subnets);
    });
  }

  //TODO: Move to helper service
  getPropertyLength(subnet: Subnet, propertyName: string) {
    const jsonFirewallRules = subnet.custom_fields.find(c => c.key === propertyName);

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

   private deploySubnet(subnet: Subnet) {
    // let firewall_rules = this.getFirewallRules(subnet);
    // let static_routes = this.getStaticRoutes(subnet);

    var extra_vars: {[k: string]: any} = {};
    // TODO: Get dynamically (or do we allow AT to set this?)
    extra_vars.customer = 'acme';
    extra_vars.subnet_id = subnet.subnet_id;
    // TODO: This should be saved as a custom property in the object or parsed out from mask_bits
    // on server side.
    extra_vars.subnet_mask = this.ips.calculateIPv4SubnetMask(`${subnet.network}/${subnet.mask_bits}`);

    const body = { extra_vars };

    this.automationApiService.launchTemplate('deploy-network', body).subscribe();
  }

  private getFirewallRules(subnet: Subnet) {
    const firewallrules = subnet.custom_fields.find(c => c.key === 'firewall_rules');
    let firewall_rules: any;

    if (firewallrules) {
      firewall_rules = JSON.parse(firewallrules.value);
    }

    if (firewall_rules == null || firewall_rules.length <= 0) { return []; }
    return firewall_rules;
  }

  private getStaticRoutes(subnet: Subnet) {
    const staticRoutes = subnet.custom_fields.find(c => c.key === 'static_routes');
    let static_routes: any;

    if (staticRoutes) {
      static_routes = JSON.parse(staticRoutes.value);
    }

    if (static_routes == null || static_routes.length <= 0) { return []; }
    return static_routes;
  }
}
