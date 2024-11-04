import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { V1NetworkSecurityFirewallRuleGroupsService, V1TiersService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';

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

  constructor(
    private tierService: V1TiersService,
    private firewallRuleGroupService: V1NetworkSecurityFirewallRuleGroupsService,
    private formBuilder: UntypedFormBuilder,
    private ngx: NgxSmartModalService,
  ) {}
  ngOnInit(): void {
    this.getTiers();
    this.buildForm();
  }

  public getTiers() {
    this.tierService.getManyTier({ page: 1, perPage: 500, sort: ['updatedAt,ASC'] }).subscribe(data => {
      this.tiers = data.data;
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

  private createFirewallRuleGroup(firewallRuleGroup): void {
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
