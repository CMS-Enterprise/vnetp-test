/* tslint:disable */

import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Netmask } from 'netmask';
import { FirewallRule, NetworkObjectGroup, ServiceObjectGroup } from '../../../../../client';
import { FirewallRulePacketTracerDto } from '../../../models/firewall/firewall-rule-packet-tracer-dto';
import SubscriptionUtil from '../../../utils/SubscriptionUtil';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IsIpV4NoSubnetValidator, ValidatePortNumber } from '../../../validators/network-form-validators';
import { cloneDeep } from 'lodash';

type FirewallRulePacketTracerOutputMap = {
  [name: string]: {
    checkList: FirewallRulePacketTracerChecklist;
  };
};

type FirewallRulePacketTracerOutput = {
  [name: string]: FirewallRulePacketTracerChecklist;
};

type FirewallRulePacketTracerChecklist = {
  action: boolean;
  sourceInRange: boolean;
  destInRange: boolean;
  sourcePort: boolean;
  destPort: boolean;
  direction: boolean;
  protocol: boolean;
  enabled: boolean;
  // application: boolean;
  softDeleted: boolean;
};

@Component({
  selector: 'app-firewall-rule-packet-tracer',
  templateUrl: './firewall-rule-packet-tracer.component.html',
  styleUrls: ['./firewall-rule-packet-tracer.component.css'],
})
export class FirewallRulePacketTracerComponent implements OnInit, OnDestroy {
  @Input() objects: FirewallRulePacketTracerDto;
  submitted: boolean;
  firewallRulesWithChecklist: FirewallRulePacketTracerOutputMap = {};
  filteredChecklist: FirewallRulePacketTracerOutputMap = {};
  form: FormGroup;

  pageSize = 10;

  filterExact = null;

  serviceTypeSubscription: Subscription;

  public environment = environment;
  public appIdEnabled = false;

  hoveredRow: any = null;
  hoveredColumn: string | null = null;

  tableConfig = {
    displayedColumns: [
      'name',
      'action',
      'sourceInRange',
      'destInRange',
      'direction',
      'protocol',
      'enabled',
      'sourcePort',
      'destPort',
      // 'application',
    ],
    columnLabels: {
      name: 'Name',
      action: 'Action',
      sourceInRange: 'Source IP',
      destInRange: 'Destination IP',
      direction: 'Direction',
      protocol: 'Protocol',
      enabled: 'Enabled',
      sourcePort: 'Source Port',
      destPort: 'Destination Port',
      // application: 'Application',
    },
    columnFunctions: {
      sourceInRange: (rule: FirewallRule) => this.handleInRange(rule, 'source', this.form.controls.sourceInRange),
      destInRange: (rule: FirewallRule) => this.handleInRange(rule, 'destination', this.form.controls.destInRange),
      sourcePort: (rule: FirewallRule) => this.handlePortMatch(rule, 'source', this.form.controls.sourcePort),
      destPort: (rule: FirewallRule) => this.handlePortMatch(rule, 'destination', this.form.controls.destPort),
      direction: (rule: FirewallRule) => this.form.controls.direction.value === rule.direction,
      protocol: (rule: FirewallRule) => this.form.controls.protocol.value === rule.protocol,
      enabled: (rule: FirewallRule) => this.form.controls.enabled.value === rule.enabled,
      action: (rule: FirewallRule) => this.form.controls.action.value === rule.action,
      // application: (rule: FirewallRule) => this.handleApplication(rule, this.form.controls.application.value.id),
      softDeleted: (rule: FirewallRule) => Boolean(rule.deletedAt),
    },
  };

  protocols = ['IP', 'ICP', 'TCP', 'UDP'];

  isDrawerOpened = false;
  fieldSubscriptions: Subscription[] = [];
  isSearchOpen = false;
  searchQuery = '';
  @ViewChild('searchInput') searchInput!: ElementRef;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder, private toastrService: ToastrService) {}

  ngOnInit(): void {
    this.buildForm();
    this.setFormValidators();
    this.applyFilter();

    // this.createFormListeners();
  }

  ngOnDestroy(): void {
    this.unsubAll();
  }

  onOpen(): void {
    this.isDrawerOpened = true;
  }

  search() {
    let totalCount = 0;
    this.objects.firewallRules.forEach(rule => {
      this.setChecklistsForRulesByField2(rule);
      this.applyFilter();
      // Object.keys(this.form.controls).forEach(field => {
      //   console.log('field', field);
      //   const control = this.form.get(field);
      //   if (control) {
      //     totalCount = totalCount + 1;

      //     // const subscription = control.valueChanges.subscribe(() => {

      //     // });
      //     // this.fieldSubscriptions.push(subscription);
      //   }
      // });
    });
  }

  createFormListeners(): void {
    Object.keys(this.form.controls).forEach(field => {
      const control = this.form.get(field);
      if (control) {
        const subscription = control.valueChanges.subscribe(() => {
          this.setChecklistsForRulesByField(field);
          this.applyFilter();
        });
        this.fieldSubscriptions.push(subscription);
      }
    });
  }

  isExactMatch(rule: FirewallRulePacketTracerOutput): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { softDeleted, ...otherValues } = rule.checkList;
    return Object.values(otherValues).every(value => value === true || value === null);
  }

  isPartialMatch(rule: FirewallRulePacketTracerOutput): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { softDeleted, ...otherValues } = rule.checkList;
    return Object.values(otherValues).some(value => value === true) && !this.isExactMatch(rule);
  }

  applyFilter(): void {
    const start = performance.now();
    this.filteredChecklist = cloneDeep(this.firewallRulesWithChecklist);
    const end = performance.now();
    console.log(`Execution time: ${end - start} ms`);
    if (this.filterExact === null && !this.searchQuery) {
      return;
    }

    if (this.filterExact !== null) {
      console.log('filter exact = null');
      Object.keys(this.firewallRulesWithChecklist).forEach(ruleName => {
        const rule = this.firewallRulesWithChecklist[ruleName];
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
    this.filterExact = null;
    this.searchQuery = '';
    this.applyFilter();
  }

  // converts octect IPs to decimals
  dot2num(dot): number {
    const d = dot.split('.');
    return ((+d[0] * 256 + +d[1]) * 256 + +d[2]) * 256 + +d[3];
  }

  // handleApplication(rule: FirewallRule, applicationId: string): boolean {
  //   if (!this.appIdEnabled) {
  //     return true;
  //   }

  //   if (applicationId === 'any') {
  //     return true;
  //   }

  //   return rule?.panosApplications?.some(app => app.id === this.form.controls.application.value);
  // }

  handleInRange(rule: FirewallRule, location: 'source' | 'destination', control: AbstractControl): boolean {
    const lookupType = location === 'source' ? rule.sourceAddressType : rule.destinationAddressType;

    if (lookupType === 'IpAddress') {
      return this.ipLookup(rule, location, control);
    } else if (lookupType === 'NetworkObject') {
      return this.networkObjectLookup(rule, location, control);
    } else if (lookupType === 'NetworkObjectGroup') {
      return this.networkObjectGroupLookup(rule, location, control);
    }
  }

  setChecklistsForRulesByField(fieldName: string): void {
    console.trace('set checklist for rules by field func');
    // const fieldValue = this.form.controls[fieldName].value;
    // const errors = this.form.controls[fieldName].errors;
    // if (errors || fieldValue === null || fieldValue === '' || fieldValue === undefined) {
    //   Object.keys(this.firewallRulesWithChecklist).forEach(ruleName => {
    //     this.clearChecklist(ruleName, fieldName);
    //   });
    //   return;
    // }
    let ruleCount = 0;
    this.setChecklist(this.objects.firewallRules, fieldName);
    // this.objects.firewallRules.forEach(rule => {
    //   this.setChecklist(rule, fieldName);
    //   ruleCount = ruleCount + 1;
    // });
    console.log('ruleCount', ruleCount);
  }

  setChecklistsForRulesByField2(rule): void {
    this.setChecklist2(rule);
    // this.objects.firewallRules.forEach(rule => {
    //   this.setChecklist(rule, fieldName);
    //   ruleCount = ruleCount + 1;
    // });
  }

  setChecklist(firewallRules, fieldName): void {
    console.trace('set checklist func');
    firewallRules.forEach(firewallRule => {
      const ruleWithChecklist = this.firewallRulesWithChecklist[firewallRule.name];
      if (!ruleWithChecklist) {
        this.firewallRulesWithChecklist[firewallRule.name] = { checkList: this.createNewChecklist() };
      }
      this.firewallRulesWithChecklist[firewallRule.name].checkList[fieldName] = this.getCellValue(fieldName, firewallRule);
    });
  }

  setChecklist2(firewallRule): void {
    console.trace('set checklist func');
    Object.keys(this.form.controls).forEach(field => {
      const fieldValue = this.form.controls[field].value;
      const errors = this.form.controls[field].errors;
      if (errors || fieldValue === null || fieldValue === '' || fieldValue === undefined) {
        // Object.keys(this.firewallRulesWithChecklist).forEach(ruleName => {
        //   this.clearChecklist(ruleName, field);
        // });
        return;
      }
      const control = this.form.get(field);
      if (control) {
        const ruleWithChecklist = this.firewallRulesWithChecklist[firewallRule.name];
        if (!ruleWithChecklist) {
          this.firewallRulesWithChecklist[firewallRule.name] = { checkList: this.createNewChecklist() };
        }
        this.firewallRulesWithChecklist[firewallRule.name].checkList[field] = this.getCellValue(field, firewallRule);
      }
    });
  }

  // setChecklist(firewallRule: FirewallRule, fieldName: string): void {
  //   console.trace('set checklist func');
  //   const ruleWithChecklist = this.firewallRulesWithChecklist[firewallRule.name];
  //   if (!ruleWithChecklist) {
  //     this.firewallRulesWithChecklist[firewallRule.name] = { checkList: this.createNewChecklist() };
  //   }
  //   console.trace('this.firewallRulesWithChecklist',this.firewallRulesWithChecklist);
  //   this.firewallRulesWithChecklist[firewallRule.name].checkList[fieldName] = this.getCellValue(fieldName, firewallRule);
  // }

  clearChecklist(firewallRuleName: string, fieldName: string): void {
    console.trace('clear checklist func');
    const ruleWithChecklist = this.firewallRulesWithChecklist[firewallRuleName];
    if (ruleWithChecklist) {
      this.firewallRulesWithChecklist[firewallRuleName].checkList[fieldName] = null;
    }
  }

  createNewChecklist(): FirewallRulePacketTracerChecklist {
    console.trace('create checklist func');
    return {
      action: null,
      sourceInRange: null,
      destInRange: null,
      sourcePort: null,
      destPort: null,
      direction: null,
      protocol: null,
      enabled: null,
      // application: null,
      softDeleted: null,
    };
  }

  handlePortMatch(rule: FirewallRule, location: 'source' | 'destination', control: AbstractControl): boolean | null {
    const start = performance.now();

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

    // Check if form port value falls within range of rule port value
    if (rulePortValue.includes('-')) {
      const firstNumberInPortRange = Number(rulePortValue.split('-')[0]);
      const lastNumberInPortRange = Number(rulePortValue.split('-')[1]);
      if (formPortValue >= firstNumberInPortRange || formPortValue <= lastNumberInPortRange) {
        return true;
      }
    }

    const end = performance.now();
    console.log(` HANDLE PORT MATCH Execution time: ${end - start} ms`);

    // Check for an exact match between the form port value and the rule's port value
    return formPortValue === rulePortValue;
  }

  ipLookup(rule: FirewallRule, location, control): boolean {
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

  networkObjectLookup(rule: FirewallRule, location: 'source' | 'destination', control: AbstractControl) {
    const start = performance.now();

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

    const end = performance.now();
    console.log(` NET OBJ LOOKUP Execution time: ${end - start} ms`);

    return false;
  }

  networkObjectGroupLookup(rule: FirewallRule, location: 'source' | 'destination', control: AbstractControl) {
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

  serviceObjectPortMatch(rule: FirewallRule, location: 'source' | 'destination', control: AbstractControl): boolean {
    const serviceObjectPortValue = location === 'source' ? rule.serviceObject.sourcePorts : rule.serviceObject.destinationPorts;

    // Check if form port value falls within range of rule port value
    if (serviceObjectPortValue.includes('-')) {
      const firstNumberInPortRange = Number(serviceObjectPortValue.split('-')[0]);
      const lastNumberInPortRange = Number(serviceObjectPortValue.split('-')[1]);
      if (control.value >= firstNumberInPortRange || control.value <= lastNumberInPortRange) {
        return true;
      }
    }
    return control.value === serviceObjectPortValue;
  }

  serviceObjectGroupPortMatch(rule: FirewallRule, location: 'source' | 'destination', control: AbstractControl): boolean {
    const serviceObjectGroup = this.getServiceObjectGroup(rule.serviceObjectGroupId);

    return serviceObjectGroup.serviceObjects.some(svcObj => {
      const rulePortValue = location === 'source' ? svcObj.sourcePorts : svcObj.destinationPorts;

      if (rulePortValue.includes('-')) {
        const firstNumberInPortRange = Number(rulePortValue.split('-')[0]);
        const lastNumberInPortRange = Number(rulePortValue.split('-')[1]);
        if (control.value >= firstNumberInPortRange || control.value <= lastNumberInPortRange) {
          return true;
        }
      }
      return rulePortValue === control.value;
    });
  }

  private unsubAll() {
    SubscriptionUtil.unsubscribe([this.serviceTypeSubscription, ...this.fieldSubscriptions]);
  }

  setFormValidators() {
    const sourcePorts = this.form.controls.sourcePort;
    const destinationPorts = this.form.controls.destPort;
    this.serviceTypeSubscription = this.form.controls.protocol.valueChanges.subscribe(serviceType => {
      switch (serviceType) {
        case 'TCP':
          sourcePorts.setValidators(Validators.compose([Validators.required, ValidatePortNumber]));
          destinationPorts.setValidators(Validators.compose([Validators.required, ValidatePortNumber]));
          break;
        case 'UDP':
          sourcePorts.setValidators(Validators.compose([Validators.required, ValidatePortNumber]));
          destinationPorts.setValidators(Validators.compose([Validators.required, ValidatePortNumber]));
          break;
        default:
          sourcePorts.setValidators(null);
          destinationPorts.setValidators(null);
          sourcePorts.setValue('');
          destinationPorts.setValue('');
          break;
      }
      sourcePorts.updateValueAndValidity();
      destinationPorts.updateValueAndValidity();
    });
  }

  get f() {
    return this.form.controls;
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      action: [''],
      direction: [''],
      protocol: [''],
      enabled: [''],
      sourceInRange: ['', Validators.compose([Validators.required, IsIpV4NoSubnetValidator])],
      destInRange: ['', Validators.compose([Validators.required, IsIpV4NoSubnetValidator])],
      // application: [''],
      sourcePort: ['', ValidatePortNumber],
      destPort: ['', ValidatePortNumber],
    });
    this.setFormValidators();
  }

  reset(): void {
    this.unsubAll();
    this.submitted = false;
    this.resetFilter();
    this.ngx.resetModalData('firewallRulePacketTracer');
  }

  close(): void {
    this.reset();
    this.ngx.close('firewallRulePacketTracer');
  }

  getNetworkObjectGroup(id): NetworkObjectGroup {
    return this.objects.networkObjectGroups.find(obj => obj.id === id);
  }
  getServiceObjectGroup(id): ServiceObjectGroup {
    return this.objects.serviceObjectGroups.find(obj => obj.id === id);
  }

  onHover(row: any, column: string | null) {
    this.hoveredRow = row;
    this.hoveredColumn = column;
  }

  getCellValue(column: string, rule: FirewallRule): boolean {
    console.log('on cell value when key entry?');
    const columnFunction = this.tableConfig.columnFunctions[column];
    return columnFunction ? columnFunction(rule) : false;
  }

  isChecklistFieldEmpty(fieldName: string, firewallRule: FirewallRule): boolean {
    console.log('isChecklistFieldEmpty run when');
    return this.firewallRulesWithChecklist[firewallRule.name].checkList[fieldName] === null;
  }

  get firewallRulesArray() {
    return Object.keys(this.filteredChecklist).map(name => ({
      name,
      ...this.filteredChecklist[name],
    }));
  }

  // onMouseMove(event: MouseEvent): void {
  //   const tableElement = document.querySelector('.table-container');
  //   const rect = tableElement?.getBoundingClientRect();
  //   if (rect && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) {
  //     this.onHover(null, null);
  //   }
  // }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      setTimeout(() => {
        this.searchInput?.nativeElement.focus();
      });
    }
  }

  resetForm(): void {
    this.form.reset();
    this.firewallRulesWithChecklist = {};
    this.resetFilter();
  }
}
