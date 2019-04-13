// TODO: Needs Cleanup
// TODO: Needs further validation against existing subnets in D42

import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { Router } from '@angular/router';
import { Network } from 'src/app/models/network';
import { ToastrService } from 'ngx-toastr';
import { IpAddressService } from 'src/app/services/ip-address.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-create-network',
  templateUrl: './create-network.component.html',
  styleUrls: ['./create-network.component.css']
})
export class CreateNetworkComponent implements OnInit {
  network = new Network();

  cidrAddress: string;
  subnetMask: string;
  usableRange: string;
  gateway: string;
  rangeSize: string;
  subnetExists: boolean;

  constructor(
    private automationApiService: AutomationApiService,
    private toastr: ToastrService,
    private router: Router,
    private ipService: IpAddressService,
    private messageService: MessageService
  ) {}

  ngOnInit() {}

  // TODO: Refactor
  calculateNetwork() {
    this.subnetExists = false;

    // If the range portion of the CIDR address is greater than 30, set it to 30.
    if (!this.ipService.ipv4MaskLessThan(this.cidrAddress, 32)) {
      this.cidrAddress = this.ipService.updateCidrMask(this.cidrAddress, 32);
    }

    // Validate that the supplied CIDR notation contains a valid IP address.
    const [isValid, error] = this.ipService.isValidIPv4CidrNotation(this.cidrAddress);
    if (!isValid) {
      return; }

    const ipv4Range = this.ipService.getIpv4Range(this.cidrAddress);
    this.usableRange = `${ipv4Range.getFirst().nextIPNumber().nextIPNumber()}-${ipv4Range.getLast().previousIPNumber()}`;
    this.rangeSize = ipv4Range.getSize().toString();
    this.gateway = `${ipv4Range.getFirst().nextIPNumber()}`;

// TODO: This network object will be returned from the IP service.
    this.network.NetworkAddress = ipv4Range.getFirst().nextIPNumber().toString();
    this.network.SubnetMask = this.ipService.calculateSubnetMask(this.cidrAddress);
    this.network.SubnetMaskBits = this.ipService.getCidrMask(this.cidrAddress);

    // Validate that the subnet doesn't already exist.
    // TODO: Debounce this method such that it is only called 500-1000ms after input stops.
    // currently it is very chatty making an API call with each keypress.
    this.automationApiService.doqlQuery(`SELECT name,network, mask_bits FROM view_subnet_v1 WHERE network = \'${ipv4Range.getFirst()}\'
    OR name = \'${this.network.Name}\'`)
    .subscribe(
      data => {
        const result = data as [];

        if (result.length > 0) {
          this.subnetExists = true;
          return;
        }
  });
}

  createNetwork() {
    const [isValid, error] = this.ipService.isValidIPv4CidrNotation(this.cidrAddress);

    if (
      !isValid ||
      !this.network.Name ||
      !this.network.NetworkAddress ||
      !this.network.SubnetMaskBits ||
      !this.network.VlanId
    ) {
      this.toastr.error('Invalid Data');
      return;
    }

    if (this.subnetExists){
      this.toastr.error('Network already exists');
      return;
    }

    const body = {
      extra_vars: `{\"vlan_id\": ${this.network.VlanId},\"ip_address\": ${this.network.NetworkAddress }
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
