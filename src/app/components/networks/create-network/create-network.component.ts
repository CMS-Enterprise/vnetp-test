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

  constructor(private automationApiService: AutomationApiService, private toastr: ToastrService, private router: Router,
              private ipService: IpAddressService) { }

  ngOnInit() {
  }

  validateIp(ipAddress: string) {
     return this.ipService.isIpAddress(ipAddress);
  }

  calculateSubnetMask() {
    if (this.network.SubnetMaskBits < 0) { this.network.SubnetMaskBits = 0; }
    if (this.network.SubnetMaskBits > 32 ) { this.network.SubnetMaskBits = 32; }

    if (!this.validateIp(this.network.NetworkAddress)) { return; }

    var result =  this.ipService.calculateSubnetMask(this.network.NetworkAddress, this.network.SubnetMaskBits);

    this.network.SubnetMask = result.prefixMaskStr;
  }

  createNetwork() {

    if (!this.network.Name || !this.network.NetworkAddress || !this.network.SubnetMaskBits || !this.network.VlanId) {
        this.toastr.error('Invalid Data');
        return;
      }

    const body = {
      extra_vars: `{\"vlan_id\": ${this.network.VlanId},\"ip_address\": ${this.network.NetworkAddress}
      ,\"subnet_mask\": ${this.network.SubnetMask},\"customer_id\": ${this.network.Name}
      ,\"subnet_mask_bits\": ${this.network.SubnetMaskBits}}`
    };

    this.automationApiService.launchTemplate('create_asa_subinterface', body).subscribe();
    this.automationApiService.launchTemplate('create_vlan', body).subscribe();
    this.automationApiService.launchTemplate('create_device42_subnet', body).subscribe();
    this.router.navigate(['/networks']);
  }
}
