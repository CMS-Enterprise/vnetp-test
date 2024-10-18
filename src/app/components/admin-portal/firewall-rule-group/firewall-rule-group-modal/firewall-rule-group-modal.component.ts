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
    this.tierService.getManyTier({ sort: ['updatedAt,ASC'] }).subscribe(data => {
      this.tiers = data;
    });
  }

  getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('firewallRuleGroupModal') as any);
    this.modalMode = dto.ModalMode;
    this.form.controls.name.enable();
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
    console.log('group', firewallRuleGroup);
    this.firewallRuleGroupService.createOneFirewallRuleGroup({ firewallRuleGroup }).subscribe(() => {
      this.closeModal();
    });
  }

  public save(): void {
    console.log('this.form', this.form);
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
    console.log('group', firewallRuleGroup);

    this.createFirewallRuleGroup(firewallRuleGroup);
  }
}
