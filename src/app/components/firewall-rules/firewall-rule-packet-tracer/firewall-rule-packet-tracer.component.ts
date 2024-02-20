/* tslint:disable */

import { Component, ElementRef, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { IpAddressAnyValidator, ValidatePortRange } from 'src/app/validators/network-form-validators';
import { FirewallRuleDestinationAddressTypeEnum, FirewallRuleSourceAddressTypeEnum } from '../../../../../client';
import { Netmask } from 'netmask';

@Component({
  selector: 'app-firewall-rule-packet-tracer',
  templateUrl: './firewall-rule-packet-tracer.component.html',
  styleUrls: ['./firewall-rule-packet-tracer.component.css'],
})
export class FirewallRulePacketTracerComponent implements OnInit {
  @Input() objects;
  form: FormGroup;
  submitted: boolean;
  modalBody;
  modalTitle;

  rulesHit = [];
  partialMatches = [];
  showPartials = false;
  doneSearching = false;
  protocolSubscription: Subscription;

  filteredRules = [];
  currentPage = 1;
  pageSize = 10;
  filterExact = false;
  filterPartial = false;

  dropdownOpen = false;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
    this.applyFilter();
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  isExactMatch(rule): boolean {
    return Object.values(rule.checkList).every(value => value === true);
  }

  isPartialMatch(rule): boolean {
    return Object.values(rule.checkList).some(value => value === true) && !this.isExactMatch(rule);
  }

  applyFilter(): void {
    if (!this.filterExact && !this.filterPartial) {
      this.filteredRules = [...this.rulesHit];
    } else {
      this.filteredRules = this.rulesHit.filter(rule => {
        const isExact = this.isExactMatch(rule);
        return (this.filterExact && isExact) || (this.filterPartial && !isExact);
      });
    }
    this.currentPage = 1;
  }

  get paginatedRules() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredRules.slice(startIndex, startIndex + this.pageSize);
  }

  // takes an ipAddress to search for and another IP Subnet and determines if the ip to search
  // falls within range
  calculateSubnet(ipToSearch, ipAddress?) {
    const split = ipAddress.split('/');
    // determine if there is a CIDR
    const [ip, cidr] = split;

    // converts all IP addresses into decimal format
    const ipNumber = this.dot2num(ip);
    const ipToSearchNum = this.dot2num(ipToSearch);

    // sends all parameters to function that determins the range of IPs

    // if we ever want to display all subnets
    // const subnets = [];
    // for (let i = 32; i >= 0; i--) {
    //   subnets.push(this.num2dot(2 ** 32 - 2 ** i));
    // }
    // console.log('subnets', subnets)

    return this.ipToRange(ipToSearchNum, ipNumber, cidr);
  }

  cidrSize(cidrSlash): number {
    return Math.pow(2, 32 - cidrSlash);
  }

  // caluculates whether an IP falls within a subnet or not
  ipToRange(ipToSearchNum, ip, cidr) {
    const size = this.cidrSize(cidr);
    const startIpNum = ip - (ip % size);
    const endIpNum = startIpNum + size - 1;
    let inRange = false;

    // if ipToCheck is inbetween our startIp and endIp
    // we know that ipToCheck falls within range
    if (startIpNum <= ipToSearchNum && endIpNum >= ipToSearchNum) {
      inRange = true;
    }

    // converts back to IP addresses
    const ipToCheckStr = this.num2dot(ipToSearchNum);
    const startIpStr = this.num2dot(startIpNum);
    const endIpStr = this.num2dot(endIpNum);
    return {
      ipToCheckStr,
      cidr,
      size,
      startIpStr,
      endIpStr,
      inRange,
    };
  }

  // converts decimal IPs back to octect format
  num2dot(num) {
    let d: any = num % 256;
    for (let i = 3; i > 0; i--) {
      num = Math.floor(num / 256);
      d = (num % 256) + '.' + d;
    }
    return d;
  }

  // converts octect IPs to decimals
  dot2num(dot): number {
    const d = dot.split('.');
    return ((+d[0] * 256 + +d[1]) * 256 + +d[2]) * 256 + +d[3];
  }

  // // TO DO : IPv6
  // convertIpv6(ipv6): void {
  //   // const ipv6Subnet = '2001:db8:0:0:8d3::/64';
  //   // simulate your address.binaryZeroPad(); method
  //   var parts = [];
  //   ipv6.split(':').forEach(function(it) {
  //     var bin = parseInt(it, 16).toString(2);
  //     while (bin.length < 16) {
  //       bin = '0' + bin;
  //     }
  //     parts.push(bin);
  //   });
  //   var bin = parts.join('');

  //   // Use BigInteger library
  //   // var dec = BigInt(bin).toString()
  //   // var dec2 = parseInt(dec, 2)
  //   // var dec3 = BigInt(dec2)
  //   console.log(bin);
  // }

  // TO DO : IPv6 Searches
  search() {
    this.rulesHit = [];
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    this.objects.firewallRules.forEach(rule => {
      const checkList = {
        sourceInRange: this.handleInRange(rule, 'source', this.form.controls.sourceIpAddress),
        destInRange: this.handleInRange(rule, 'destination', this.form.controls.destinationIpAddress),
        sourcePortMatch: this.handlePortMatch(rule, 'source', this.form.controls.sourcePorts),
        destPortMatch: this.handlePortMatch(rule, 'destination', this.form.controls.destinationPorts),
        directionMatch: this.form.controls.direction.value === rule.direction,
        protocolMatch: this.form.controls.protocol.value === rule.protocol,
        enabledMatch: this.form.controls.enabled.value === rule.enabled,
      };

      if (checkList.sourcePortMatch === null || checkList.destPortMatch === null) {
        delete checkList.sourcePortMatch;
        delete checkList.destPortMatch;
      }

      this.rulesHit.push({ checkList, name: rule.name });
    });
  }

  handleInRange(rule, location: 'source' | 'destination', control: AbstractControl) {
    const lookupType = location === 'source' ? rule.sourceAddressType : rule.destinationAddressType;

    if (lookupType === 'IpAddress') {
      return this.ipLookup(rule, location, control);
    } else if (lookupType === 'NetworkObject') {
      return this.networkObjectLookup(rule, location, control);
    } else if (lookupType === 'NetworkObjectGroup') {
      return this.networkObjectGroupLookup(rule, location, control);
    }
  }

  handlePortMatch(rule, location: 'source' | 'destination', control: AbstractControl): boolean | null {
    const formPortValue = control.value;

    // Return null if the form control value is falsy, indicating an invalid or non-applicable condition
    if (!formPortValue) {
      return null;
    }

    // Determine the appropriate port value from the rule based on the location
    const rulePortValue = location === 'source' ? rule.sourcePorts : rule.destinationPorts;

    // Disallow port ranges in the form port value; return null for this invalid condition
    if (formPortValue.includes('-')) {
      control.setErrors({ portRangeNotAllowed: true });
      return null;
    }

    // Delegate to specific handlers based on the service type and return their results
    if (rule.serviceType === 'ServiceObject') {
      return this.serviceObjectPortMatch(rule, location, control);
    } else if (rule.serviceType === 'ServiceObjectGroup') {
      return this.serviceObjectGroupPortMatch(rule, location, control);
    }

    // Check for an exact match between the form port value and the rule's port value
    return formPortValue === rulePortValue;
  }

  ipLookup(rule, location, control) {
    const formIpValue = control.value;
    const ruleIpValue = location === 'source' ? rule.sourceIpAddress : rule.destinationIpAddress;

    // Using Netmask to handle subnet calculations
    try {
      const block = new Netmask(ruleIpValue);
      if (block.contains(formIpValue)) {
        return true; // The form IP is within the rule's IP range
      }
    } catch (error) {
      console.error('Error with IP calculations:', error);
    }

    // Fallback to exact match if needed
    return formIpValue === ruleIpValue;
  }

  networkObjectLookup(rule, location: 'source' | 'destination', control: AbstractControl) {
    const formIpValue = control.value;
    const ruleNetworkObject = location === 'source' ? rule.sourceNetworkObject : rule.destinationNetworkObject;

    // Check if ruleNetworkObject is an IP/Subnet
    if (ruleNetworkObject.type === 'IpAddress') {
      const ruleSourceIp = ruleNetworkObject.ipAddress;
      try {
        const block = new Netmask(ruleSourceIp);
        if (block.contains(formIpValue)) {
          return true; // The form IP is within the rule's IP range
        }
      } catch (error) {
        console.error('Error with IP calculations:', error);
      }
    }
    // Handle if networkObject is a range of IPs
    else if (ruleNetworkObject.type === 'Range') {
      const startIpNum = this.dot2num(ruleNetworkObject.startIpAddress);
      const endIpNum = this.dot2num(ruleNetworkObject.endIpAddress);
      const searchIpNum = this.dot2num(formIpValue);

      // Check if the searchIpNum is within the range
      if (startIpNum <= searchIpNum && searchIpNum <= endIpNum) {
        return true;
      }
    }

    return false;
  }

  networkObjectGroupLookup(rule, location: 'source' | 'destination', control: AbstractControl) {
    const formIpValue = control.value;
    const ruleNetworkObjectGroup = location === 'source' ? rule.sourceNetworkObjectGroup : rule.destinationNetworkObjectGroup;
    const networkObjectMembers = ruleNetworkObjectGroup.networkObjects;

    return networkObjectMembers.some(sourceMember => {
      if (sourceMember.type === 'IpAddress') {
        const sourceMemberIp = sourceMember.ipAddress;
        try {
          const block = new Netmask(sourceMemberIp);
          if (block.contains(formIpValue)) {
            // If the form IP is within the rule's IP range or matches the IP
            return true;
          }
        } catch (error) {
          console.error('Error with IP calculations:', error);
          // If there's an error (e.g., invalid IP or subnet), just skip this iteration
        }
      } else if (sourceMember.type === 'Range') {
        const startIpNum = this.dot2num(sourceMember.startIpAddress);
        const endIpNum = this.dot2num(sourceMember.endIpAddress);
        const searchIpNum = this.dot2num(formIpValue);

        // Check if the searchIpNum falls within the specified range
        if (startIpNum <= searchIpNum && searchIpNum <= endIpNum) {
          return true;
        }
      }

      // Continue checking other members if no match found yet
      return false;
    });
  }

  serviceObjectPortMatch(rule, location: 'source' | 'destination', control: AbstractControl): boolean {
    const serviceObjectPortValue = location === 'source' ? rule.serviceObject.sourcePorts : rule.serviceObject.destinationPorts;
    return control.value === serviceObjectPortValue;
  }

  serviceObjectGroupPortMatch(rule, location: 'source' | 'destination', control: AbstractControl): boolean {
    const serviceObjectGroup = rule.serviceObjectGroup;

    return serviceObjectGroup.serviceObjects.some(svcObj => {
      const rulePortValue = location === 'source' ? svcObj.sourcePorts : svcObj.destinationPorts;
      return rulePortValue === control.value;
    });
  }

  get f() {
    return this.form.controls;
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      direction: [''],
      protocol: [''],
      enabled: [true],
      sourceIpAddress: ['', Validators.compose([Validators.required, IpAddressAnyValidator])],
      destinationIpAddress: ['', Validators.compose([Validators.required, IpAddressAnyValidator])],

      sourcePorts: ['', ValidatePortRange],
      destinationPorts: ['', ValidatePortRange],
    });
  }

  reset(): void {
    this.submitted = false;
    this.rulesHit = [];
    this.partialMatches = [];
    this.showPartials = false;
    this.form.reset();
    this.ngx.resetModalData('firewallRulePacketTracer');
    this.buildForm();
  }

  close(): void {
    this.reset();
    this.ngx.close('firewallRulePacketTracer');
  }
}
