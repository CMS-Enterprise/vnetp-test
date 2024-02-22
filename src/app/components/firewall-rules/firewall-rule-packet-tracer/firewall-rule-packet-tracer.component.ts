/* tslint:disable */

import { Component, HostListener, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { IsIpV4NoSubnetValidator, ValidatePortNumber } from 'src/app/validators/network-form-validators';
import { Netmask } from 'netmask';

@Component({
  selector: 'app-firewall-rule-packet-tracer',
  templateUrl: './firewall-rule-packet-tracer.component.html',
  styleUrls: ['./firewall-rule-packet-tracer.component.css'],
})
export class FirewallRulePacketTracerComponent implements OnInit {
  @Input() objects; // TODO: Use Type
  form: FormGroup;
  submitted: boolean;

  rulesHit = [];
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedElement = event.target as HTMLElement; // Cast to HTMLElement
    if (!clickedElement.closest('.dropdown')) {
      this.dropdownOpen = false;
    }
  }

  isExactMatch(rule): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { softDeleted, ...otherValues } = rule.checkList;
    return Object.values(otherValues).every(value => value === true);
  }

  isPartialMatch(rule): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { softDeleted, ...otherValues } = rule.checkList;
    return Object.values(otherValues).some(value => value === true) && !this.isExactMatch(rule);
  }

  applyFilter(): void {
    if (!this.filterExact && !this.filterPartial) {
      this.filteredRules = [...this.rulesHit];
    } else {
      this.filteredRules = this.rulesHit.filter(rule => {
        const isExact = this.isExactMatch(rule);
        const isPartial = this.isPartialMatch(rule);
        return (this.filterExact && isExact) || (this.filterPartial && isPartial);
      });
    }
    this.currentPage = 1;
  }

  resetFilter(): void {
    this.filterExact = false;
    this.filterPartial = false;
  }

  // converts octect IPs to decimals
  dot2num(dot): number {
    const d = dot.split('.');
    return ((+d[0] * 256 + +d[1]) * 256 + +d[2]) * 256 + +d[3];
  }

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
        softDeleted: Boolean(rule.deletedAt),
      };

      if (checkList.sourcePortMatch === null || checkList.destPortMatch === null) {
        delete checkList.sourcePortMatch;
        delete checkList.destPortMatch;
      }

      this.rulesHit.push({ checkList, name: rule.name });
    });
    this.resetFilter();
    this.applyFilter();
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
    } catch (error) {}

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
      } catch (error) {}
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
    const ruleNetworkObjectGroupId = location === 'source' ? rule.sourceNetworkObjectGroupId : rule.destinationNetworkObjectGroupId;
    const ruleNetworkObjectGroup = this.getNetworkObjectGroup(ruleNetworkObjectGroupId);

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
        } catch (error) {}
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
    const serviceObjectGroup = this.getServiceObjectGroup(rule.serviceObjectGroupId);

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
      sourceIpAddress: ['', Validators.compose([Validators.required, IsIpV4NoSubnetValidator])],
      destinationIpAddress: ['', Validators.compose([Validators.required, IsIpV4NoSubnetValidator])],

      sourcePorts: ['', ValidatePortNumber],
      destinationPorts: ['', ValidatePortNumber],
    });
  }

  reset(): void {
    this.submitted = false;
    this.rulesHit = [];
    this.form.reset();
    this.resetFilter();
    this.ngx.resetModalData('firewallRulePacketTracer');
    this.buildForm();
  }

  close(): void {
    this.reset();
    this.ngx.close('firewallRulePacketTracer');
  }

  getNetworkObjectGroup(id) {
    return this.objects.networkObjectGroups.find(obj => obj.id === id);
  }
  getServiceObjectGroup(id) {
    return this.objects.serviceObjectGroups.find(obj => obj.id === id);
  }
}
