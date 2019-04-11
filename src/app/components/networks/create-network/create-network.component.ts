import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { Router } from '@angular/router';
import { routerNgProbeToken } from '@angular/router/src/router_module';
import { Network } from 'src/app/models/network';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-create-network',
  templateUrl: './create-network.component.html',
  styleUrls: ['./create-network.component.css']
})
export class CreateNetworkComponent implements OnInit {

  network = new Network();

  constructor(private automationApiService: AutomationApiService, private messageService: MessageService, private router: Router) { }

  ngOnInit() {
  }

  createNetwork() {

    const body = {
      extra_vars: `{\"vlan_id\": ${this.network.VlanId},\"ip_address\": ${this.network.NetworkAddress}
      ,\"subnet_mask\": ${this.network.SubnetMask},\"customer_id\": ${this.network.Name}
      ,\"subnet_mask_bits\": ${this.network.SubnetMaskBits}}`
    };

    this.automationApiService.launchTemplate('create_asa_subinterface', body).subscribe();
    this.automationApiService.launchTemplate('create_vlan', body).subscribe();
    this.automationApiService.launchTemplate('create_device42_subnet', body).subscribe();

    this.messageService.filter('Job Launched');

    this.router.navigate(['/networks']);
  }
}
