import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { V1NetworkSecurityNatRuleGroupsService, V1TiersService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';

@Component({
  selector: 'app-nat-rule-group-modal',
  templateUrl: './nat-rule-group-modal.component.html',
})
export class NatRuleGroupModalComponent implements OnInit {
  form: UntypedFormGroup;
  submitted: boolean;
  modalMode: ModalMode;
  messageId: string;
  tiers;

  constructor(
    private tierService: V1TiersService,
    private natRuleGroupService: V1NetworkSecurityNatRuleGroupsService,
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
    const dto = Object.assign({}, this.ngx.getModalData('natRuleGroupModal') as any);
    this.modalMode = dto.ModalMode;
    this.ngx.resetModalData('natRuleGroupModal');
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('natRuleGroupModal');
    this.reset();
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('natRuleGroupModal');
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.maxLength(100), Validators.required])],
      tier: ['', Validators.required],
      groupType: ['ZoneBased', Validators.required],
    });
  }

  private createNatRuleGroup(natRuleGroup): void {
    this.natRuleGroupService.createOneNatRuleGroup({ natRuleGroup }).subscribe(() => {
      this.closeModal();
    });
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { name, tier, groupType } = this.form.value;

    const natRuleGroup = {
      name,
      tierId: tier,
      type: groupType,
    };

    this.createNatRuleGroup(natRuleGroup);
  }
}
