/* tslint:disable */
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { IpAddressAnyValidator, ValidatePortRange } from 'src/app/validators/network-form-validators';
import { Netmask } from 'netmask';
import { NatRule, NetworkObjectGroup } from '../../../../../client';

@Component({
  selector: 'app-nat-rule-packet-tracer',
  templateUrl: './nat-rule-packet-tracer.component.html',
})
export class NatRulePacketTracerComponent implements OnInit {
  @Input() objects = {
    natRules: [],
    networkObjectGroups: [],
  };
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
    this.applyFilter();
    this.buildForm();
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

  get paginatedRules() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredRules.slice(startIndex, startIndex + this.pageSize);
  }

  handleInRange(
    rule,
    location: 'originalSource' | 'originalDestination' | 'translatedSource' | 'translatedDestination',
    control: AbstractControl,
  ) {
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

  networkObjectLookup(
    rule,
    location: 'originalSource' | 'originalDestination' | 'translatedSource' | 'translatedDestination',
    control: AbstractControl,
  ) {
    const formIpValue = control.value;
    let ruleNetworkObject;
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

  networkObjectGroupLookup(
    rule,
    location: 'originalSource' | 'originalDestination' | 'translatedSource' | 'translatedDestination',
    control: AbstractControl,
  ) {
    const formIpValue = control.value;
    let ruleNetworkObjectGroupId;

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

  getNetworkObjectGroup(id) {
    return this.objects.networkObjectGroups.find(obj => obj.id === id);
  }

  handleServiceObjectPortMatch(
    rule: any, // Assuming rule is of a type that has originalServiceObject and translatedServiceObject properties
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

    // Determine which port value to use based on the location parameter
    const serviceObjectPortValue = location === 'source' ? serviceObject.sourcePorts : serviceObject.destinationPorts;

    // Compare the form port value to the service object port value
    return formPortValue === serviceObjectPortValue;
  }

  // takes an ipAddress to search for and another IP Subnet and determines if the ip to search
  // falls within range
  calculateSubnet(ipToSearch, ipAddress) {
    const split = ipAddress.split('/');
    // determine if there is a CIDR
    const [ip, cidr] = split;

    // converts all IP addresses into decimal format
    const ipNumber = this.dot2num(ip);
    const ipToSearchNum = this.dot2num(ipToSearch);

    // sends all parameters to function that determins the range of IPs
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

  search() {
    this.rulesHit = [];
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    this.objects.natRules.forEach(rule => {
      const checkList = {
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
    console.log('Rules Hit:', this.rulesHit);
    return this.rulesHit;
  }

  get f() {
    return this.form.controls;
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      direction: [''],
      biDirectional: [''],
      enabled: [true],

      originalSourceIp: ['', Validators.compose([Validators.required, IpAddressAnyValidator])],
      originalDestinationIp: ['', Validators.compose([Validators.required, IpAddressAnyValidator])],
      originalSourcePort: ['', ValidatePortRange],
      originalDestinationPort: ['', ValidatePortRange],

      translatedSourceIp: ['', IpAddressAnyValidator],
      translatedDestinationIp: ['', IpAddressAnyValidator],
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
