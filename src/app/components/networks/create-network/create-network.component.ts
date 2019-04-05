// TODO: Needs Cleanup
// TODO: Needs further validation against existing subnets in D42

import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { Router } from '@angular/router';
import { Network } from 'src/app/models/network';
import { ToastrService } from 'ngx-toastr';
import { IpAddressService } from 'src/app/services/ip-address.service';

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
  rangeSize: string;

  constructor(
    private automationApiService: AutomationApiService,
    private toastr: ToastrService,
    private router: Router,
    private ipService: IpAddressService
  ) {}

  ngOnInit() {}

  calculateNetwork() {

    // If the range portion of the CIDR address is greater than 30, set it to 30.
    if (!this.ipService.ipv4MaskLessThan(this.cidrAddress, 30)) {
      this.cidrAddress = this.ipService.updateCidrMask(this.cidrAddress, 30);
    }

    const [isValid, error] = this.ipService.isValidIPv4CidrNotation(this.cidrAddress);
    if (!isValid) { return; }

    let ipv4Range = this.ipService.getIpv4Range(this.cidrAddress);
    this.usableRange = `${ipv4Range.getFirst().nextIPNumber().nextIPNumber()}-${ipv4Range.getLast()}`;
    this.rangeSize = ipv4Range.getSize().toString();

    this.network.NetworkAddress = ipv4Range.getFirst().nextIPNumber().toString();
    this.network.SubnetMask = this.ipService.calculateSubnetMask(this.cidrAddress);
    this.network.SubnetMaskBits = this.ipService.getCidrMask(this.cidrAddress);
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

    const body = {
      extra_vars: `{\"vlan_id\": ${this.network.VlanId},\"ip_address\": ${
        this.network.NetworkAddress
      }
      ,\"subnet_mask\": ${this.network.SubnetMask},\"customer_id\": ${
        this.network.Name
      }
      ,\"subnet_mask_bits\": ${this.network.SubnetMaskBits}}`
    };

    this.automationApiService
      .launchTemplate('create_asa_subinterface', body)
      .subscribe();
    this.automationApiService.launchTemplate('create_vlan', body).subscribe();
    this.automationApiService
      .launchTemplate('create_device42_subnet', body)
      .subscribe();
    this.router.navigate(['/networks']);
  }
}
