import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EndpointGroup, Selector, SelectorSelectorTypeEnum, V2AppCentricEndpointGroupsService, V2AppCentricSelectorsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { Tab } from 'src/app/common/tabs/tabs.component';
import { TableContextService } from 'src/app/services/table-context.service';
import { IpAddressAnyValidator } from 'src/app/validators/network-form-validators';

@Component({
  selector: 'app-selector-modal',
  templateUrl: './selector-modal.component.html',
  styleUrls: ['./selector-modal.component.scss'],
})
export class SelectorModalComponent implements OnInit, OnDestroy {
  public form: UntypedFormGroup;
  public submitted: boolean;
  public selectorModalSubscription: Subscription;
  selectorTypeSubscription: Subscription;
  navIndex = 0;
  public currentTab: string;
  @Input() tenantId;
  @Input() endpointSecurityGroupId;

  endpointGroups: EndpointGroup[];
  selector: Selector;

  public tabs: Tab[] = [{ name: 'Tag Selector' }, { name: 'EPG Selector' }, { name: 'IP Subnet Selector' }];

  constructor(
    private formBuilder: UntypedFormBuilder,
    public selectorService: V2AppCentricSelectorsService,
    private ngx: NgxSmartModalService,
    private endpointGroupService: V2AppCentricEndpointGroupsService,
  ) {}
  ngOnDestroy(): void {}

  public setFormValidators() {
    this.submitted = false;

    const tagKey = this.form.get('tagKey');
    const valueOperator = this.form.get('valueOperator');
    const tagValue = this.form.get('tagValue');
    const epgSelector = this.form.get('epgId');
    const ipSubnet = this.form.get('IpSubnet');

    if (this.navIndex === 0) {
      // set validators for tag selector form groups
      tagKey.setValidators(Validators.required);
      valueOperator.setValidators(Validators.required);
      tagValue.setValidators(Validators.required);

      // remove validators for EPG and IpSubnet form groups
      epgSelector.removeValidators(Validators.required);
      ipSubnet.removeValidators(Validators.required);
    } else if (this.navIndex === 1) {
      // set validator for EPGSelector form group
      epgSelector.addValidators(Validators.required);

      // remove validators for tag selector and IpSubnet form groups
      tagKey.removeValidators(Validators.required);
      valueOperator.removeValidators(Validators.required);
      tagValue.removeValidators(Validators.required);
      ipSubnet.removeValidators(Validators.required);
    } else if (this.navIndex === 2) {
      // set validator for ipSubnet form group
      ipSubnet.setValidators(Validators.required);

      // remove validators for tag selector and EPG selector form groups
      tagKey.removeValidators(Validators.required);
      valueOperator.removeValidators(Validators.required);
      tagValue.removeValidators(Validators.required);
      epgSelector.removeValidators(Validators.required);
    }

    tagKey.updateValueAndValidity();
    valueOperator.updateValueAndValidity();
    tagValue.updateValueAndValidity();

    epgSelector.updateValueAndValidity();
    ipSubnet.updateValueAndValidity();
  }

  ngOnInit(): void {
    this.buildForm();
    this.getEndpointGroups();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      tagKey: ['', Validators.required],
      valueOperator: ['', Validators.required],
      tagValue: ['', Validators.required],
      epgId: [null, Validators.required],
      IpSubnet: ['', [Validators.required, IpAddressAnyValidator]],
      description: ['', Validators.maxLength(500)],
    });
  }

  get f() {
    return this.form.controls;
  }

  public save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    const modalSelector = {} as any;

    this.selector.endpointSecurityGroupId = this.endpointSecurityGroupId;
    if (this.navIndex === 0) {
      this.selector.selectorType = SelectorSelectorTypeEnum.Tag;
      modalSelector.tagKey = this.form.value.tagKey;
      modalSelector.valueOperator = this.form.value.valueOperator;
      modalSelector.tagValue = this.form.value.tagValue;
    } else if (this.navIndex === 1) {
      this.selector.selectorType = SelectorSelectorTypeEnum.Epg;
      modalSelector.epgId = this.form.value.epgId;
    } else {
      this.selector.selectorType = SelectorSelectorTypeEnum.IpSubnet;
      modalSelector.IpSubnet = this.form.value.IpSubnet;
    }

    this.selectorService.createOneSelector({ selector: modalSelector }).subscribe(data => {
      this.reset();
      return data;
    });
  }

  public reset() {
    this.form.reset();
    this.ngx.resetModalData('selectorModal');
    this.ngx.close('selectorModal');
  }

  public getData() {
    this.setFormValidators();
  }

  public handleTabChange(tab: Tab): void {
    // if user clicks on the same tab that they are currently on, don't load any new objects
    if (this.navIndex === this.tabs.findIndex(t => t.name === tab.name)) {
      return;
    }
    this.ngx.resetModalData('selectorModal');
    this.navIndex = this.tabs.findIndex(t => t.name === tab.name);
    this.setFormValidators();
  }

  public getEndpointGroups() {
    this.endpointGroupService
      .getManyEndpointGroup({ filter: [`tenantId||eq||${this.tenantId}`], page: 1, perPage: 100 })
      .subscribe(data => {
        this.endpointGroups = data.data;
      });
  }
}
