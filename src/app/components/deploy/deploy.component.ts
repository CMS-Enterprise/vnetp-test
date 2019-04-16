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

  constructor(private hs: HelpersService, private automationApiService: AutomationApiService, private ips: IpAddressService) { }

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
    const body = {
            extra_vars: `{\"vlan_id\": ${subnet.description},\"ip_address\": ${subnet.gateway}
           ,\"subnet_mask\": ${this.ips.calculateIPv4SubnetMask(`${subnet.network}/${subnet.mask_bits}`)}
            ,\"customer_id\": ${subnet.name},\"subnet_mask_bits\": ${subnet.mask_bits},
            \"subnet_id\": ${subnet.subnet_id}}`
          };
    this.automationApiService.launchTemplate('create_asa_subinterface', body).subscribe();
    this.automationApiService.launchTemplate('create_vlan', body).subscribe();
    this.automationApiService.launchTemplate('deploy_device42_subnet', body).subscribe();

    // TODO: Track status of network deploy jobs and launch additional jobs
    // when network deploy jobs have completed.
    setTimeout(() => this.deployFirewallRules(subnet), 30 * 1000);
    setTimeout(() => this.deployStaticRoutes(subnet), 30 * 1000);
  }

  private deployFirewallRules(subnet: Subnet) {


    const firewallrules = subnet.custom_fields.find(c => c.key === 'firewall_rules');
    let firewall_rules: any;

    if (firewallrules) {
      firewall_rules = JSON.parse(firewallrules.value);
    }

    if (firewall_rules.length <= 0) { return; }

    const body = {
      extra_vars: `{\"customer_id\": ${subnet.name},\"vlan_id\": ${subnet.description},
      \"firewall_rules\": ${JSON.stringify(firewall_rules)},\"subnet_id\": ${subnet.subnet_id}}`
    };

    this.automationApiService.launchTemplate('update_asa_acl', body).subscribe();
  }

  private deployStaticRoutes(subnet: Subnet) {
    const staticRoutes = subnet.custom_fields.find(c => c.key === 'static_routes');
    let static_routes: any;

    if (staticRoutes) {
      static_routes = JSON.parse(staticRoutes.value);
    }

    if (static_routes.length <= 0) { return; }

    const body = {
      extra_vars: `{\"customer_id\": ${subnet.name},
      \"subnet_id\": ${subnet.subnet_id},
      \"updated_static_routes\": ${JSON.stringify(static_routes)},
      \"deleted_static_routes\": ${JSON.stringify([])}}`
    };

    this.automationApiService.launchTemplate('update_asa_static_routes', body).subscribe();
  }
}
