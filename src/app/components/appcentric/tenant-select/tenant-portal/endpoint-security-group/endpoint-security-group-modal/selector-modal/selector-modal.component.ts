import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { EndpointGroup, V2AppCentricEndpointGroupsService, V2AppCentricSelectorsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { Tab } from 'src/app/common/tabs/tabs.component';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import { IpAddressAnyValidator } from 'src/app/validators/network-form-validators';

@Component({
  selector: 'app-selector-modal',
  templateUrl: './selector-modal.component.html',
  styleUrls: ['./selector-modal.component.scss'],
})
export class SelectorModalComponent implements OnInit {
  public form: UntypedFormGroup;
  public submitted: boolean;
  public selectorModalSubscription: Subscription;
  selectorTypeSubscription: Subscription;
  navIndex = 0;
  public currentTab: string;
  @Input() tenantId;
  @Input() endpointSecurityGroupId;
  @Input() vrfId;

  endpointGroups: EndpointGroup[];
  public selector;

  public tabs: Tab[] = [{ name: 'Tag Selector' }, { name: 'EPG Selector' }, { name: 'IP Subnet Selector' }];

  constructor(
    private formBuilder: UntypedFormBuilder,
    public selectorService: V2AppCentricSelectorsService,
    private ngx: NgxSmartModalService,
    private endpointGroupService: V2AppCentricEndpointGroupsService,
  ) {}

  public setFormValidators(): void {
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
      epgSelector.clearValidators();
      ipSubnet.clearValidators();
    } else if (this.navIndex === 1) {
      // set validator for EPGSelector form group
      epgSelector.addValidators(Validators.required);

      // remove validators for tag selector and IpSubnet form groups
      tagKey.clearValidators();
      valueOperator.clearValidators();
      tagValue.clearValidators();
      ipSubnet.clearValidators();
    } else if (this.navIndex === 2) {
      // set validator for ipSubnet form group
      ipSubnet.setValidators(Validators.compose([Validators.required, IpAddressAnyValidator]));

      // remove validators for tag selector and EPG selector form groups
      tagKey.clearValidators();
      valueOperator.clearValidators();
      tagValue.clearValidators();
      epgSelector.clearValidators();
    }

    tagKey.updateValueAndValidity();
    valueOperator.updateValueAndValidity();
    tagValue.updateValueAndValidity();

    epgSelector.updateValueAndValidity();
    ipSubnet.updateValueAndValidity();
  }

  ngOnInit(): void {
    this.buildForm();
  }

  public buildForm(): void {
    this.form = this.formBuilder.group({
      tagKey: ['', Validators.required],
      valueOperator: ['', Validators.required],
      tagValue: ['', Validators.required],
      epgId: [null, Validators.required],
      IpSubnet: [null, Validators.compose([Validators.required, IpAddressAnyValidator])],
      description: ['', Validators.maxLength(500)],
    });
  }

  get f() {
    return this.form.controls;
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    this.selector.endpointSecurityGroupId = this.endpointSecurityGroupId;
    if (this.navIndex === 0) {
      this.selector.selectorType = 'Tag';
      this.selector.tagKey = this.form.value.tagKey;
      this.selector.valueOperator = this.form.value.valueOperator;
      this.selector.tagValue = this.form.value.tagValue;
    } else if (this.navIndex === 1) {
      this.selector.selectorType = 'EPG';
      this.selector.epgId = this.form.value.epgId;
      this.selector.endpointGroupName = ObjectUtil.getObjectName(this.form.value.epgId, this.endpointGroups);
    } else {
      this.selector.selectorType = 'IpSubnet';
      this.selector.IpSubnet = this.form.value.IpSubnet;
    }
    this.selector.tenantId = this.tenantId;
    this.selectorService.createOneSelector({ selector: this.selector }).subscribe(data => {
      this.reset();
      return data;
    });

    // if the selector matches an EPG to an ESG
    // update the endpoint group entity to reflect that it is now matched to an ESG via a Selector
    if (this.selector.selectorType === 'EPG') {
      let selectedEndpointGroup = {} as any;
      this.endpointGroupService.getOneEndpointGroup({ id: this.selector.epgId }).subscribe(epg => {
        selectedEndpointGroup = epg;

        // remove properties that can not be updated
        delete selectedEndpointGroup.name;
        delete selectedEndpointGroup.tenantId;
        delete selectedEndpointGroup.applicationProfileId;

        // set esgMatched property to true
        selectedEndpointGroup.esgMatched = true;

        // update endpoint group entity
        this.endpointGroupService
          .updateOneEndpointGroup({ id: selectedEndpointGroup.id, endpointGroup: selectedEndpointGroup })
          .subscribe();
      });
    }
  }

  public reset(): void {
    this.form.reset();
    this.ngx.resetModalData('selectorModal');
    this.ngx.close('selectorModal');
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('selectorModal') as any);
    this.selector = dto.selector;
    this.getEndpointGroups();

    this.setFormValidators();
  }

  public handleTabChange(tab: Tab): void {
    // if user clicks on the same tab that they are currently on, don't load any new objects
    if (this.navIndex === this.tabs.findIndex(t => t.name === tab.name)) {
      return;
    }
    this.form.reset();
    this.navIndex = this.tabs.findIndex(t => t.name === tab.name);
    this.setFormValidators();
  }

  public getEndpointGroups(): EndpointGroup[] {
    this.endpointGroupService
      .getManyEndpointGroup({
        filter: [`tenantId||eq||${this.tenantId}`, 'deletedAt||isnull'],
        page: 1,
        perPage: 1000,
        join: ['bridgeDomain'],
      })
      .subscribe(data => {
        this.endpointGroups = data.data;
        // available endpoint groups MUST belong to the same vrf as the endpoint security group
        this.endpointGroups = this.endpointGroups.filter(epg => epg.bridgeDomain.vrfId === this.vrfId);

        // filter out EPGs that have already been used to create a Selector for this ESG
        if (this.selector) {
          this.endpointGroups = this.endpointGroups.filter(
            epg => !this.selector.existingEpgSelectors.some(selectorEpg => selectorEpg.endpointGroupName === epg.name),
          );
        }
      });
    return this.endpointGroups;
  }
}
