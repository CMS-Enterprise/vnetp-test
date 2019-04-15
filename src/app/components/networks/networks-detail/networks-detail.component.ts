import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { MessageService } from 'src/app/services/message.service';
import { SubnetResponse, Subnet } from 'src/app/models/d42/subnet';
import { HelpersService } from 'src/app/services/helpers.service';
import { IpAddressService } from 'src/app/services/ip-address.service';

@Component({
  selector: 'app-networks-detail',
  templateUrl: './networks-detail.component.html',
  styleUrls: ['./networks-detail.component.css']
})
export class NetworksDetailComponent implements OnInit {

  constructor(private automationApiService: AutomationApiService, private messageService: MessageService,
              private route: ActivatedRoute, private router: Router, private hs: HelpersService, private ips: IpAddressService ) {
    this.subnetIps = {};
    this.subnet = new Subnet();
   }

  Id = '';
  subnet: Subnet;
  subnetIps: any;
  deployedState = false;

  ngOnInit() {
    this.Id  += this.route.snapshot.paramMap.get('id');

    this.getNetwork();
    this.getIps();
  }

  getNetwork() {
    this.automationApiService.getSubnet(this.Id).subscribe(
      data => {
        this.subnet = data as Subnet;
        this.deployedState = this.hs.getBooleanCustomField(this.subnet, 'deployed');
      });
  }

  getIps() {
    this.automationApiService.getSubnetIps(this.Id).subscribe(
      data => this.subnetIps = data,
      error => console.error(error)
    );
  }

  deploySubnet() {
    const body = {
      extra_vars: `{\"vlan_id\": ${this.subnet.description},\"ip_address\": ${this.subnet.gateway}
      ,\"subnet_mask\": ${this.ips.calculateIPv4SubnetMask(`${this.subnet.network}/${this.subnet.mask_bits}`)}
      ,\"customer_id\": ${this.subnet.name},\"subnet_mask_bits\": ${this.subnet.mask_bits},
      \"subnet_id\": ${this.subnet.subnet_id}}`
    };

    this.automationApiService.launchTemplate('create_asa_subinterface', body).subscribe();
    this.automationApiService.launchTemplate('create_vlan', body).subscribe();
    this.automationApiService.launchTemplate('deploy_device42_subnet', body).subscribe();

    this.deployedState = true;

    this.messageService.filter('Job Launched');
  }

  deleteSubnet() {
    const body = {
      extra_vars: `{\"customer_id\": ${this.subnet.name},
       \"vlan_id\": ${this.hs.getNumberCustomField(this.subnet, 'vlan_number')},
       \"subnet_id\": ${this.subnet.subnet_id}}`
    };

    if (this.deployedState) {
     this.automationApiService.launchTemplate('delete_asa_subinterface', body).subscribe();
     this.automationApiService.launchTemplate('delete_vlan', body).subscribe();
    }

    this.automationApiService.launchTemplate('delete_device42_subnet', body).subscribe();

    this.messageService.filter('Job Launched');

    this.router.navigate(['/networks']);
  }
}
