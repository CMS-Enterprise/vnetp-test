/* eslint-disable */
import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { IsIpV4NoSubnetValidator, ValidatePortRange, ValidatePortNumber } from 'src/app/validators/network-form-validators';
import { Netmask } from 'netmask';
import { NatRule, NetworkObject, NetworkObjectGroup } from '../../../../../client';
import { NatRulePacketTracerDto } from '../../../models/nat/nat-rule-packet-tracer-dto';
import { ToastrService } from 'ngx-toastr';
import { cloneDeep } from 'lodash';

type NatRulePacketTracerOutputMap = {
  [name: string]: {
    checkList: NatRulePacketTracerCheckList;
  };
};

type NatRulePacketTracerOutput = {
  [name: string]: NatRulePacketTracerCheckList;
};

type NatRulePacketTracerCheckList = {
  originalSourceInRange: boolean;
  originalDestInRange: boolean;
  translatedSourceInRange: boolean;
  translatedDestInRange: boolean;
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
  natRulesWithChecklist: NatRulePacketTracerOutputMap = {};
  filteredChecklist;

  rulesHit = [];
  filteredRules = [];
  tableRules = [];
  isSearchingRules = false;
  currentPage = 1;
  pageSize = 10;

  filterExact = null;
  filterPartial = false;

  // dropdownOpen = false;
  isDrawerOpened = false;
  hoveredRow: any = null;
  hoveredColumn: string | null = null;

  tableConfig = {
    displayedColumns: [
      'name',
      'originalSourceInRange',
      'originalDestInRange',
      'translatedSourceInRange',
      'translatedDestInRange',
      'originalSourcePort',
      'originalDestPort',
      'translatedSourcePort',
      'translatedDestPort',
      'direction',
      'biDirectional',
      'enabled',
    ],
    columnLabels: {
      name: 'Name',
      originalSourceInRange: 'Original Source IP',
      originalDestInRange: 'Original Destination IP',
      translatedSourceInRange: 'Translated Source IP',
      translatedDestInRange: 'Translated Destination IP',
      originalSourcePort: 'Original Source Port',
      originalDestPort: 'Original Destination Port',
      translatedSourcePort: 'Translated Source Port',
      translatedDestPort: 'Translated Destination Port',
      direction: 'Direction',
      biDirectional: 'BiDirectional',
      enabled: 'Enabled',
    },
    columnFunctions: {
      originalSourceInRange: (rule: NatRule) => this.handleInRange(rule, 'originalSource', this.form.controls.originalSourceInRange),
      originalDestInRange: (rule: NatRule) => this.handleInRange(rule, 'originalDestination', this.form.controls.originalDestInRange),
      translatedSourceInRange: (rule: NatRule) => this.handleInRange(rule, 'translatedSource', this.form.controls.translatedSourceInRange),
      translatedDestInRange: (rule: NatRule) => this.handleInRange(rule, 'translatedDestination', this.form.controls.translatedDestInRange),
      originalSourcePort: (rule: NatRule) =>
        this.handleServiceObjectPortMatch(rule, 'original', 'source', this.form.controls.originalSourcePort),
      originalDestPort: (rule: NatRule) =>
        this.handleServiceObjectPortMatch(rule, 'original', 'destination', this.form.controls.originalDestPort),
      translatedSourcePort: (rule: NatRule) =>
        this.handleServiceObjectPortMatch(rule, 'translated', 'source', this.form.controls.translatedSourcePort),
      translatedDestPort: (rule: NatRule) =>
        this.handleServiceObjectPortMatch(rule, 'translated', 'destination', this.form.controls.translatedDestPort),
      direction: (rule: NatRule) => this.form.controls.direction.value === rule.direction,
      biDirectional: (rule: NatRule) => this.form.controls.protocol.value === rule.biDirectional,
      enabled: (rule: NatRule) => this.form.controls.enabled.value === rule.enabled,
      softDeleted: (rule: NatRule) => Boolean(rule.deletedAt),
    },
  };

  isSearchOpen = false;
  searchQuery = '';
  @ViewChild('searchInput') searchInput!: ElementRef;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder, private toastrService: ToastrService) {}

  ngOnInit(): void {
    this.buildForm();
    this.applyFilter();
  }

  onOpen(): void {
    console.log('hit here on open!');
    this.isDrawerOpened = true;
  }

  search() {
    this.isSearchingRules = true;
    const start = performance.now();
    this.objects.natRules.forEach(rule => {
      this.setChecklist(rule);
    });
    this.applyFilter();

    this.tableRules = Object.keys(this.filteredChecklist).map(name => ({
      name,
      ...this.filteredChecklist[name],
    }));
    const end = performance.now();
    console.log(end - start);

    // manual timeout so spinner has time to load and unload in the HTML
    // without this setTimeout no spinner will appear in the UI when searching rules
    setTimeout(() => {
      this.isSearchingRules = false;
    }, 1000);
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

  setChecklist(natRule): void {
    Object.keys(this.form.controls).forEach(field => {
      const fieldValue = this.form.controls[field].value;
      const errors = this.form.controls[field].errors;
      if (errors || fieldValue === null || fieldValue === '' || fieldValue === undefined) {
        Object.keys(this.natRulesWithChecklist).forEach(ruleName => {
          this.clearChecklist(ruleName, field);
        });
        return;
      }
      const control = this.form.get(field);
      if (control) {
        const ruleWithChecklist = this.natRulesWithChecklist[natRule.name];
        if (!ruleWithChecklist) {
          this.natRulesWithChecklist[natRule.name] = { checkList: this.createNewChecklist() };
        }
        this.natRulesWithChecklist[natRule.name].checkList[field] = this.getCellValue(field, natRule);
      }
    });
  }

  clearChecklist(natRuleName: string, fieldName: string): void {
    const ruleWithChecklist = this.natRulesWithChecklist[natRuleName];
    if (ruleWithChecklist) {
      this.natRulesWithChecklist[natRuleName].checkList[fieldName] = null;
    }
  }

  createNewChecklist(): NatRulePacketTracerCheckList {
    return {
      originalSourceInRange: null,
      originalDestInRange: null,
      translatedSourceInRange: null,
      translatedDestInRange: null,
      originalSourcePortMatch: null,
      originalDestPortMatch: null,
      translatedSourcePortMatch: null,
      translatedDestPortMatch: null,
      directionMatch: null,
      biDirectionalMatch: null,
      enabledMatch: null,
      softDeleted: null,
    };
  }

  applyFilter(): void {
    // console.log('running apply filter');
    this.filteredChecklist = cloneDeep(this.natRulesWithChecklist);
    if (this.filterExact === null && !this.searchQuery) {
      return;
    }

    if (this.filterExact !== null) {
      Object.keys(this.natRulesWithChecklist).forEach(ruleName => {
        const rule = this.natRulesWithChecklist[ruleName];
        const isExact = this.isExactMatch(rule);
        const isPartial = this.isPartialMatch(rule);
        if ((this.filterExact && isExact) || (this.filterExact === false && isPartial)) {
          this.filteredChecklist[ruleName] = rule;
        } else {
          delete this.filteredChecklist[ruleName];
        }
      });
    }

    if (this.searchQuery) {
      Object.keys(this.filteredChecklist).forEach(ruleName => {
        if (!ruleName.toLowerCase().includes(this.searchQuery.toLowerCase())) {
          delete this.filteredChecklist[ruleName];
        }
      });
    }
  }

  resetFilter(): void {
    this.filterExact = false;
    this.filterPartial = false;
    this.searchQuery = '';
    this.applyFilter();
  }

  handleInRange(rule: NatRule, location: NatRulePacketTracerLocation, control: AbstractControl): boolean {
    let lookupType;
    // console.log('control',control)

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

  getCellValue(column: string, rule: NatRule): boolean {
    const columnFunction = this.tableConfig.columnFunctions[column];
    return columnFunction ? columnFunction(rule) : false;
  }

  // toggleDropdown(): void {
  //   this.dropdownOpen = !this.dropdownOpen;
  // }

  // search(): void {
  //   this.rulesHit = [];
  //   this.submitted = true;
  //   if (this.form.invalid) {
  //     return;
  //   }

  //   this.objects.natRules.forEach(rule => {
  //     const checkList: NatRulePacketTracerCheckList = {
  //       originalSourceIPInRange: this.handleInRange(rule, 'originalSource', this.form.controls.originalSourceIp),
  //       originalDestIPInRange: this.handleInRange(rule, 'originalDestination', this.form.controls.originalDestinationIp),
  //       translatedSourceIPInRange: this.handleInRange(rule, 'translatedSource', this.form.controls.translatedSourceIp),
  //       translatedDestIPInRange: this.handleInRange(rule, 'translatedDestination', this.form.controls.translatedDestinationIp),

  //       originalSourcePortMatch: this.handleServiceObjectPortMatch(rule, 'original', 'source', this.form.controls.originalSourcePort),
  //       originalDestPortMatch: this.handleServiceObjectPortMatch(
  //         rule,
  //         'original',
  //         'destination',
  //         this.form.controls.originalDestinationPort,
  //       ),
  //       translatedSourcePortMatch: this.handleServiceObjectPortMatch(rule, 'translated', 'source', this.form.controls.translatedSourcePort),
  //       translatedDestPortMatch: this.handleServiceObjectPortMatch(
  //         rule,
  //         'translated',
  //         'destination',
  //         this.form.controls.translatedDestinationPort,
  //       ),

  //       directionMatch: this.form.controls.direction.value === rule.direction,
  //       biDirectionalMatch: this.form.controls.biDirectional.value === rule.biDirectional,
  //       enabledMatch: this.form.controls.enabled.value === rule.enabled,
  //       softDeleted: Boolean(rule.deletedAt),
  //     };
  //     this.rulesHit.push({ checkList, name: rule.name });
  //   });
  //   this.resetFilter();
  //   this.applyFilter();
  //   this.toastrService.success('Packet Tracer Executed.');
  // }

  get f() {
    return this.form.controls;
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      originalSourceInRange: ['', Validators.compose([Validators.required, IsIpV4NoSubnetValidator])],
      originalDestInRange: ['', Validators.compose([Validators.required, IsIpV4NoSubnetValidator])],
      translatedSourceInRange: ['', IsIpV4NoSubnetValidator],
      translatedDestInRange: ['', IsIpV4NoSubnetValidator],
      originalSourcePort: ['', ValidatePortNumber],
      originalDestPort: ['', ValidatePortNumber],
      translatedSourcePort: ['', ValidatePortNumber],
      translatedDestPort: ['', ValidatePortNumber],
      direction: [''],
      biDirectional: [''],
      enabled: [],
    });
  }

  reset(): void {
    this.submitted = false;
    this.resetFilter();
    this.tableRules = [];
    this.form.reset();
  }

  close(): void {
    this.reset();
    this.isDrawerOpened = false;
    this.ngx.close('natRulePacketTracer');
  }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      setTimeout(() => {
        this.searchInput?.nativeElement.focus();
      });
    }
  }
}
