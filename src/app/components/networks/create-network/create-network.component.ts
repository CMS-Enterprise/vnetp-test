// TODO: Input argument is not an input element

import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IpAddressService } from 'src/app/services/ip-address.service';
import { MessageService } from 'src/app/services/message.service';
import { Subnet } from 'src/app/models/d42/subnet';

@Component({
  selector: 'app-create-network',
  templateUrl: './create-network.component.html',
  styleUrls: ['./create-network.component.css']
})
export class CreateNetworkComponent implements OnInit {
  subnet: Subnet;

  cidrAddress: string;
  usableRange: string;
  rangeSize: string;
  nameExists: boolean;
  networkExists: boolean;
  networkOverlaps: boolean;
  existingSubnet: Subnet;
  showDetails: boolean;
  vlanId: number;

  constructor(
    private automationApiService: AutomationApiService,
    private toastr: ToastrService,
    private router: Router,
    private ipService: IpAddressService,
    private messageService: MessageService
  ) {
    this.subnet = new Subnet();
  }

  ngOnInit() {}

  calculateNetwork() {
    this.nameExists = false;
    this.networkExists = false;
    this.networkOverlaps = false;
    this.showDetails = false;

    if (!this.cidrAddress) { return; }

    // If the range portion of the CIDR address is greater than 32, set it to 32.
    if (!this.ipService.ipv4MaskLessThan(this.cidrAddress, 32)) {
      this.cidrAddress = this.ipService.updateIPv4CidrMask(this.cidrAddress, 32);
    }

    // Validate that the supplied CIDR notation contains a valid IP address.
    const [isValid, error] = this.ipService.isValidIPv4CidrNotation(this.cidrAddress);
    if (!isValid) {
      return; }

    // Set additional properties
    const ipv4Range = this.ipService.getIpv4Range(this.cidrAddress);
    this.usableRange = `${ipv4Range.getFirst().nextIPNumber().nextIPNumber()}-${ipv4Range.getLast().previousIPNumber()}`;
    this.rangeSize = ipv4Range.getSize().toString();
    this.subnet.network = ipv4Range.getFirst().toString();
    this.subnet.gateway = `${ipv4Range.getFirst().nextIPNumber()}`;
    this.subnet.subnet_mask = this.ipService.calculateIPv4SubnetMask(this.cidrAddress);
    this.subnet.mask_bits = this.ipService.getIPv4CidrMask(this.cidrAddress);
    this.showDetails = true;
}

  createNetwork() {
    const [isValid, error] = this.ipService.isValidIPv4CidrNotation(this.cidrAddress);

    if (!isValid || !this.subnet.name || !this.subnet.network ||
      !this.subnet.mask_bits || !this.subnet.subnet_mask) {
      this.toastr.error('Invalid Data');
      return;
    }

    this.checkDuplicate();
  }

  // Check to ensure that an existing subnet is not using the same name or network address.
  private checkDuplicate() {
    const ipv4Range = this.ipService.getIpv4Range(this.cidrAddress);
    this.automationApiService.doqlQuery(`SELECT subnet_pk as subnet_id,name,network,mask_bits FROM view_subnet_v1
    WHERE network = \'${ipv4Range.getFirst()}\' OR name = \'${this.subnet.name}\'`)
    .subscribe(data => {
        const existingSubnets = data as Subnet[];
        if (existingSubnets.length > 0) {
          const existingSubnet = existingSubnets[0];

          if (this.subnet.name === existingSubnet.name) {
            this.toastr.error('Name already in use.');
            this.nameExists = true;
          }

          if (this.subnet.network === existingSubnet.network) {
            this.toastr.error('Subnet already in use.');
            this.networkExists = true;
          }
          return;
        } else {
          this.checkOverlap();
        }
      });
  }

  // Check all existing subnets to ensure that the new subnet doesn't contain them and
  // that they don't contain the new subnet.
  private checkOverlap() {
    this.automationApiService.doqlQuery('select subnet_pk as subnet_id, name, network, mask_bits from view_subnet_v1')
    .subscribe(data => {
        const existingSubnets = data as Subnet[];
        const result = this.ipService.checkIPv4RangeOverlap(this.subnet, existingSubnets);
        if (result[0]) {
          this.networkOverlaps = true;
          this.existingSubnet = result[1];

          this.toastr.error('Subnet overlaps with at least one existing subnet: ' +
          `${this.existingSubnet.network}/${this.existingSubnet.mask_bits}`);
        } else {
          this.launchJobs();
        }
      });
  }

  private launchJobs() {
    const body = {
      extra_vars: `{\"vlan_id\": ${this.vlanId},\"ip_address\": ${this.subnet.gateway }
      ,\"subnet_mask\": ${this.subnet.subnet_mask},\"customer_id\": ${this.subnet.name}
      ,\"subnet_mask_bits\": ${this.subnet.mask_bits}}`
    };

    this.automationApiService.launchTemplate('create_asa_subinterface', body).subscribe();
    this.automationApiService.launchTemplate('create_vlan', body).subscribe();
    this.automationApiService.launchTemplate('create_device42_subnet', body).subscribe();

    this.messageService.filter('Job Launched');
    this.router.navigate(['/networks']);
  }
}
