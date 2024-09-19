import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { EndpointGroup, V2AppCentricEndpointGroupsService, V2AppCentricSelectorsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { Tab } from 'src/app/common/tabs/tabs.component';
import { TableContextService } from 'src/app/services/table-context.service';

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
  selector;

  public tabs: Tab[] = [{ name: 'Tag Selector' }, { name: 'EPG Selector' }, { name: 'IP Subnet Selector' }];

  constructor(
    private formBuilder: UntypedFormBuilder,
    public selectorService: V2AppCentricSelectorsService,
    private tableContextService: TableContextService,
    private ngx: NgxSmartModalService,
    private router: Router,
    private endpointGroupService: V2AppCentricEndpointGroupsService,
  ) {}
  ngOnDestroy(): void {
    console.log('on destroy');
  }

  private addTagSelectorFormValidators() {}

  ngOnInit(): void {
    console.log('ngoninit for selector modal');
    this.buildForm();
    this.getEndpointGroups();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: [''],
      tagKey: [''],
      valueOperator: [''],
      tagValue: [''],
      epgId: [''],
      IpSubnet: [''],
      description: [''],
    });
  }

  get f() {
    return this.form.controls;
  }

  public save() {
    const modalSelector = {} as any;

    modalSelector.endpointSecurityGroupId = this.endpointSecurityGroupId;
    if (this.navIndex === 0) {
      modalSelector.selectorType = 'Tag';
      modalSelector.tagKey = this.form.value.tagKey;
      modalSelector.valueOperator = this.form.value.valueOperator;
      modalSelector.tagValue = this.form.value.tagValue;
    } else if (this.navIndex === 1) {
      modalSelector.selectorType = 'EPG';
      modalSelector.epgId = this.form.value.epgId;
    } else {
      modalSelector.selectorType = 'IpSubnet';
      modalSelector.IpSubnet = this.form.value.IpSubnet;
    }

    console.log('modalSelector', modalSelector);
    this.selectorService.createOneSelector({ selector: modalSelector }).subscribe(data => {
      this.reset();
      return data;
    });
  }

  public reset() {
    this.currentTab = this.tabs[0].name;
    this.form.reset();
    this.ngx.resetModalData('selectorModal');
    this.ngx.close('selectorModal');
  }

  public getData() {
    console.log('endpointSecurityGroupId', this.endpointSecurityGroupId);
  }

  public handleTabChange(tab: Tab): void {
    console.log('is this hit when we close?');
    // if user clicks on the same tab that they are currently on, don't load any new objects
    if (this.navIndex === this.tabs.findIndex(t => t.name === tab.name)) {
      console.log('condition??');
      return;
    }
    this.ngx.resetModalData('selectorModal');
    this.navIndex = this.tabs.findIndex(t => t.name === tab.name);

    // if (this.navIndex === 0) {
    //     this.addTagSelectorFormValidators()
    // }
  }

  public getEndpointGroups() {
    this.endpointGroupService
      .getManyEndpointGroup({ filter: [`tenantId||eq||${this.tenantId}`], page: 1, perPage: 100 })
      .subscribe(data => {
        this.endpointGroups = data.data;
      });
  }
}
