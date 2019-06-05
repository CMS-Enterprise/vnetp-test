import { Component, OnInit, HostListener } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IpAddressService } from 'src/app/services/ip-address.service';
import { Subnet, SubnetResponse } from 'src/app/models/d42/subnet';
import { Vrf } from 'src/app/models/d42/vrf';
import { ComponentCanDeactivate } from 'src/app/guards/pending-changes.guard';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-create-network',
  templateUrl: './create-network.component.html',
  styleUrls: ['./create-network.component.css']
})
export class CreateNetworkComponent implements OnInit, ComponentCanDeactivate {
  subnet: Subnet;
  vrfs: Vrf[];

  cidrAddress: string;
  usableRange: string;
  rangeSize: string;
  nameExists: boolean;
  networkExists: boolean;
  vlanExists: boolean;
  networkOverlaps: boolean;
  invalidGateway: boolean;
  existingSubnet: Subnet;
  showDetails: boolean;
  vlanId: number;

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return false; // TODO: Evaluate form state.
  }

  constructor(
    private automationApiService: AutomationApiService,
    private toastr: ToastrService,
    private router: Router,
    private ipService: IpAddressService
  ) {
    this.subnet = new Subnet();
  }

  ngOnInit() {
    this.getVrf();
  }

  getVrf() {
    this.automationApiService.getVrfs().subscribe(data => {
      this.vrfs = data;
    });
  }

  calculateNetwork() {
    this.nameExists = false;
    this.networkExists = false;
    this.vlanExists = false;
    this.networkOverlaps = false;
    this.invalidGateway = false;
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

    const ipv4Range = this.ipService.getIpv4Range(this.cidrAddress);
    const gateway = this.cidrAddress.split('/')[0];
    const result = this.ipService.isValidGateway(gateway, ipv4Range);

    if (!result) {
      this.invalidGateway = true;
      return;
    } else {
      this.subnet.gateway = gateway;
    }

    // Set additional properties
    this.usableRange = `${ipv4Range.getFirst().nextIPNumber()}-${ipv4Range.getLast().previousIPNumber()}`;
    this.rangeSize = ipv4Range.getSize().toString();
    this.subnet.network = ipv4Range.getFirst().toString();
    this.subnet.subnet_mask = this.ipService.calculateIPv4SubnetMask(this.cidrAddress);
    this.subnet.mask_bits = this.ipService.getIPv4CidrMask(this.cidrAddress);
    this.showDetails = true;
}

  createNetwork(action: string) {
    const [isValid, error] = this.ipService.isValidIPv4CidrNotation(this.cidrAddress);

    if (!isValid || !this.subnet.name || !this.subnet.network ||
      !this.subnet.mask_bits || !this.subnet.subnet_mask ||
      !this.subnet.vrf_group_id) {
      this.toastr.error('Invalid Data');
      return;
    }

    this.automationApiService.getSubnets(this.subnet.vrf_group_id).subscribe(data => {
      const subnetResponse = data as SubnetResponse;
      this.checkNetwork(subnetResponse.subnets, action);
    });
  }

  // Validate that network isn't a duplicate of another and that it doesn't overlap with any existing networks.
  private checkNetwork(existingSubnets: Subnet[], action: string) {
    let error = false;

    const checkDuplicateResult = this.ipService.checkIPv4SubnetDuplicate(this.subnet, this.vlanId, existingSubnets);

    if (checkDuplicateResult[0]) {
        error = true;
        switch (checkDuplicateResult[1]) {
          case 'name': {
            this.nameExists = true;
            break;
          }
          case 'network': {
            this.networkExists = true;
            break;
          }
          case 'vlan': {
            this.vlanExists = true;
            break;
          }
        }
      }

    // Only check range overlap if network is not a duplicate.
    if (checkDuplicateResult[1] !== 'network') {
    const checkOverlapResult = this.ipService.checkIPv4RangeOverlap(this.subnet, existingSubnets);

    if (checkOverlapResult[0]) {
      error = true;
      this.networkOverlaps = true;
      this.existingSubnet = checkOverlapResult[1];
      }
    }

    if (!error) {
    this.launchJobs(); }
  }

  // Launch required automation jobs
  private launchJobs() {
    let extra_vars: {[k: string]: any} = {};
    extra_vars.subnet = this.subnet;
    extra_vars.vlan_id = this.vlanId;

    const body = { extra_vars };

    this.automationApiService.launchTemplate('save-network', body, true).subscribe();
    this.router.navigate(['/networks']);
  }
}
