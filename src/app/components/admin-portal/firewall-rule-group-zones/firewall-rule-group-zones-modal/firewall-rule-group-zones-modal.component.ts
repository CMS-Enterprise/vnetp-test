import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Message, V1NetworkSecurityZonesService, V1TiersService, V3GlobalMessagesService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';

@Component({
  selector: 'app-firewall-rule-group-zones-modal',
  templateUrl: './firewall-rule-group-zones-modal.component.html',
  styleUrls: ['./firewall-rule-group-zones-modal.component.scss'],
})
export class FirewallRuleGroupZonesModalComponent implements OnInit {
  form: UntypedFormGroup;
  submitted: boolean;
  modalMode: ModalMode;
  messageId: string;
  tiers;

  constructor(
    private tierService: V1TiersService,
    private zoneService: V1NetworkSecurityZonesService,
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
    const dto = Object.assign({}, this.ngx.getModalData('firewallRuleGroupZonesModal') as any);
    this.modalMode = dto.ModalMode;
    this.form.controls.name.enable();
    this.ngx.resetModalData('firewallRuleGroupZonesModal');
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('firewallRuleGroupZonesModal');
    this.reset();
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('firewallRuleGroupZonesModal');
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.maxLength(100), Validators.required])],
      tier: ['', Validators.required],
    });
  }

  private createZone(zone): void {
    this.zoneService.createOneZone({ zone }).subscribe(() => {
      this.closeModal();
    });
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { name, tier } = this.form.value;
    const zone = {
      name,
      tierId: tier,
    };
    if (this.modalMode === ModalMode.Create) {
      this.createZone(zone);
    }
  }
}
