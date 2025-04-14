import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Datacenter, FirewallRuleGroup, V1DatacentersService, V1NetworkSecurityFirewallRuleGroupsService, V1TiersService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import ObjectUtil from 'src/app/utils/ObjectUtil';

@Component({
  selector: 'app-firewall-rule-group-modal',
  templateUrl: './firewall-rule-group-modal.component.html',
})
export class FirewallRuleGroupModalComponent implements OnInit {
  form: UntypedFormGroup;
  submitted: boolean;
  modalMode: ModalMode;
  messageId: string;
  tiers;
  datacenters: Datacenter[];

  constructor(
    private tierService: V1TiersService,
    private firewallRuleGroupService: V1NetworkSecurityFirewallRuleGroupsService,
    private formBuilder: UntypedFormBuilder,
    private ngx: NgxSmartModalService,
    private datacenterService: V1DatacentersService,
  ) {}
  ngOnInit(): void {
    this.getDatacenters();
    setTimeout(() => this.getTiers(), 250);
    this.buildForm();
  }

  public getDatacenters(): void {
    this.datacenterService.getManyDatacenter({ page: 1, perPage: 500 }).subscribe(data => {
      this.datacenters = data.data;
    });
  }

  public getTiers(): void {
    this.tierService.getManyTier({ page: 1, perPage: 500, sort: ['updatedAt,ASC'] }).subscribe(data => {
      this.tiers = data.data;
      this.tiers.map(tier => {
        const datacenterName = ObjectUtil.getObjectName(tier.datacenterId, this.datacenters);
        tier.nameWithDatacenter = `${tier.name} (${datacenterName})`;
      });
    });
  }

  getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('firewallRuleGroupModal') as any);
    this.modalMode = dto.ModalMode;
    this.ngx.resetModalData('firewallRuleGroupModal');
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('firewallRuleGroupModal');
    this.reset();
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('firewallRuleGroupModal');
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.maxLength(100), Validators.required])],
      tier: ['', Validators.required],
      groupType: ['ZoneBased', Validators.required],
    });
  }

  private createFirewallRuleGroup(firewallRuleGroup: FirewallRuleGroup): void {
    this.firewallRuleGroupService.createOneFirewallRuleGroup({ firewallRuleGroup }).subscribe(() => {
      this.closeModal();
    });
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { name, tier, groupType } = this.form.value;

    const firewallRuleGroup = {
      name,
      tierId: tier,
      type: groupType,
    };

    this.createFirewallRuleGroup(firewallRuleGroup);
  }
}
