/* eslint-disable */
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { IsIpNoSubnet, IsIpV4NoSubnetValidator, ValidatePortRange } from 'src/app/validators/network-form-validators';
import { Netmask } from 'netmask';
import { NatRule, NetworkObject, NetworkObjectGroup } from '../../../../../client';
import { NatRulePacketTracerDto } from '../../../models/nat/nat-rule-packet-tracer-dto';
import { ToastrService } from 'ngx-toastr';
import { isInSubnet } from 'is-in-subnet';

type NatRulePacketTracerOutput = {
  checkList: NatRulePacketTracerCheckList;
  name: string;
};

type NatRulePacketTracerCheckList = {
  originalSourceIPInRange: boolean;
  originalDestIPInRange: boolean;
  translatedSourceIPInRange: boolean;
  translatedDestIPInRange: boolean;
  originalSourcePortMatch: boolean;
  originalDestPortMatch: boolean;
  translatedSourcePortMatch: boolean;
  translatedDestPortMatch: boolean;
  directionMatch: boolean;
  biDirectionalMatch: boolean;
  enabledMatch: boolean;
  softDeleted: boolean;
};

type NatRulePacketTracerLocation = 'originalSource' | 'originalDestination' | 'translatedSource' | 'translatedDestination';

@Component({
  selector: 'app-nat-rule-packet-tracer',
  templateUrl: './nat-rule-packet-tracer.component.html',
  styleUrls: ['./nat-rule-packet-tracer.component.css'],
})
export class NatRulePacketTracerComponent implements OnInit {
  @Input() objects: NatRulePacketTracerDto;
  form: FormGroup;
  submitted: boolean;

  rulesHit = [];
  filteredRules = [];
  currentPage = 1;
  pageSize = 10;

  filterExact = false;
  filterPartial = false;

  dropdownOpen = false;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder, private toastrService: ToastrService) {}

  ngOnInit(): void {
    this.applyFilter();
    this.buildForm();
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedElement = event.target as HTMLElement; // Cast to HTMLElement
    if (!clickedElement.closest('.dropdown')) {
      this.dropdownOpen = false;
    }
  }

  isExactMatch(rule: NatRulePacketTracerOutput): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { softDeleted, ...otherValues } = rule.checkList;
    return Object.values(otherValues).every(value => value === true);
  }

  isPartialMatch(rule: NatRulePacketTracerOutput): boolean {
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

  handleInRange(rule: NatRule, location: NatRulePacketTracerLocation, control: AbstractControl): boolean {
    let lookupType;
    const formIpValue = control.value;

    switch (location) {
      case 'originalSource':
        lookupType = rule.originalSourceAddressType;
        break;
      case 'originalDestination':
        lookupType = rule.originalDestinationAddressType;
        break;
      case 'translatedSource':
        lookupType = rule.translatedSourceAddressType;
        break;
      case 'translatedDestination':
        lookupType = rule.translatedDestinationAddressType;
        break;
    }

    if (lookupType === 'None' && !formIpValue) {
      return true;
    }

    if (lookupType === 'None') {
      return false;
    }

    if (lookupType === 'NetworkObject') {
      return this.networkObjectLookup(rule, location, control);
    } else if (lookupType === 'NetworkObjectGroup') {
      return this.networkObjectGroupLookup(rule, location, control);
    }
  }

  networkObjectLookup(rule: NatRule, location: NatRulePacketTracerLocation, control: AbstractControl): boolean {
    const formIpValue = control.value;
    let ruleNetworkObject: NetworkObject;
    switch (location) {
      case 'originalSource':
        ruleNetworkObject = rule.originalSourceNetworkObject;
        break;
      case 'originalDestination':
        ruleNetworkObject = rule.originalDestinationNetworkObject;
        break;
      case 'translatedSource':
        ruleNetworkObject = rule.translatedSourceNetworkObject;
        break;
      case 'translatedDestination':
        ruleNetworkObject = rule.translatedDestinationNetworkObject;
        break;
    }

    // Check if ruleNetworkObject is an IP/Subnet
    if (ruleNetworkObject.type === 'IpAddress') {
      const ruleSourceIp = ruleNetworkObject.ipAddress;
      // if rule IP value is quad 0's, that will match every IP address
      if (ruleSourceIp === '0.0.0.0/0') {
        // so return true
        return true;
      }
      try {
        // The form IP value is within the rule's IP range
        if (isInSubnet(formIpValue, ruleSourceIp)) {
          return true;
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

  networkObjectGroupLookup(rule: NatRule, location: NatRulePacketTracerLocation, control: AbstractControl): boolean {
    const formIpValue = control.value;
    let ruleNetworkObjectGroupId: string;

    switch (location) {
      case 'originalSource':
        ruleNetworkObjectGroupId = rule.originalSourceNetworkObjectGroupId;
        break;
      case 'originalDestination':
        ruleNetworkObjectGroupId = rule.originalDestinationNetworkObjectGroupId;
        break;
      case 'translatedSource':
        ruleNetworkObjectGroupId = rule.translatedSourceNetworkObjectGroupId;
        break;
      case 'translatedDestination':
        ruleNetworkObjectGroupId = rule.translatedDestinationNetworkObjectGroupId;
        break;
    }
    const ruleNetworkObjectGroup = this.getNetworkObjectGroup(ruleNetworkObjectGroupId);

    const networkObjectMembers = ruleNetworkObjectGroup.networkObjects;

    return networkObjectMembers.some(sourceMember => {
      if (sourceMember.type === 'IpAddress') {
        const sourceMemberIp = sourceMember.ipAddress;
        // if rule IP value is quad 0's, that will match every IP address
        if (sourceMemberIp === '0.0.0.0/0') {
          // so return true
          return true;
        }
        try {
          // The form IP value is within the rule's IP range
          if (isInSubnet(formIpValue, sourceMemberIp)) {
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

  getNetworkObjectGroup(id): NetworkObjectGroup {
    return this.objects.networkObjectGroups.find(obj => obj.id === id);
  }

  handleServiceObjectPortMatch(
    rule: NatRule,
    translation: 'original' | 'translated',
    location: 'source' | 'destination',
    control: AbstractControl,
  ): boolean {
    const formPortValue = control.value;

    // Determine which service object to use based on the translation parameter
    const serviceObject = translation === 'original' ? rule?.originalServiceObject : rule?.translatedServiceObject;

    // Check if both service object and form port value are absent, return true as they match in absence
    if (!serviceObject && !formPortValue) {
      return true;
    }

    // If one is present but the other is not, return false
    if (!serviceObject || !formPortValue) {
      return false;
    }

    // a form port value of "any" matches all port values
    if (formPortValue === 'any') {
      // so return true
      return true;
    }

    // Determine which port value to use based on the location parameter
    const serviceObjectPortValue = location === 'source' ? serviceObject.sourcePorts : serviceObject.destinationPorts;

    // a service object port value of "any" matches all port values
    if (serviceObjectPortValue === 'any') {
      // so return true
      return true;
    }

    // Check if form port value falls within range of rule port value
    if (serviceObjectPortValue.includes('-')) {
      const firstNumberInPortRange = Number(serviceObjectPortValue.split('-')[0]);
      const lastNumberInPortRange = Number(serviceObjectPortValue.split('-')[1]);
      if (formPortValue >= firstNumberInPortRange || formPortValue <= lastNumberInPortRange) {
        return true;
      }
    }

    // Compare the form port value to the service object port value
    return formPortValue === serviceObjectPortValue;
  }

  // converts octect IPs to decimals
  dot2num(dot): number {
    const d = dot.split('.');
    return ((+d[0] * 256 + +d[1]) * 256 + +d[2]) * 256 + +d[3];
  }

  search(): void {
    this.rulesHit = [];
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    this.objects.natRules.forEach(rule => {
      const checkList: NatRulePacketTracerCheckList = {
        originalSourceIPInRange: this.handleInRange(rule, 'originalSource', this.form.controls.originalSourceIp),
        originalDestIPInRange: this.handleInRange(rule, 'originalDestination', this.form.controls.originalDestinationIp),
        translatedSourceIPInRange: this.handleInRange(rule, 'translatedSource', this.form.controls.translatedSourceIp),
        translatedDestIPInRange: this.handleInRange(rule, 'translatedDestination', this.form.controls.translatedDestinationIp),

        originalSourcePortMatch: this.handleServiceObjectPortMatch(rule, 'original', 'source', this.form.controls.originalSourcePort),
        originalDestPortMatch: this.handleServiceObjectPortMatch(
          rule,
          'original',
          'destination',
          this.form.controls.originalDestinationPort,
        ),
        translatedSourcePortMatch: this.handleServiceObjectPortMatch(rule, 'translated', 'source', this.form.controls.translatedSourcePort),
        translatedDestPortMatch: this.handleServiceObjectPortMatch(
          rule,
          'translated',
          'destination',
          this.form.controls.translatedDestinationPort,
        ),

        directionMatch: this.form.controls.direction.value === rule.direction,
        biDirectionalMatch: this.form.controls.biDirectional.value === rule.biDirectional,
        enabledMatch: this.form.controls.enabled.value === rule.enabled,
        softDeleted: Boolean(rule.deletedAt),
      };
      this.rulesHit.push({ checkList, name: rule.name });
    });
    this.resetFilter();
    this.applyFilter();
    this.toastrService.success('Packet Tracer Executed.');
  }

  get f() {
    return this.form.controls;
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      direction: [''],
      biDirectional: [''],
      enabled: [true],

      originalSourceIp: ['', Validators.compose([Validators.required, IsIpNoSubnet])],
      originalDestinationIp: ['', Validators.compose([Validators.required, IsIpNoSubnet])],
      originalSourcePort: ['', ValidatePortRange],
      originalDestinationPort: ['', ValidatePortRange],

      translatedSourceIp: ['', IsIpNoSubnet],
      translatedDestinationIp: ['', IsIpNoSubnet],
      translatedSourcePort: ['', ValidatePortRange],
      translatedDestinationPort: ['', ValidatePortRange],
    });
  }

  reset(): void {
    this.submitted = false;
    this.rulesHit = [];
    this.form.reset();
    this.resetFilter();
    this.ngx.resetModalData('natRulePacketTracer');
    this.buildForm();
  }

  close(): void {
    this.reset();
    this.ngx.close('natRulePacketTracer');
  }
}
