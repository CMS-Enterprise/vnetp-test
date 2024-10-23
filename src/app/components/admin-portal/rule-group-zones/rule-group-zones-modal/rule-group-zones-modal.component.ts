import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { V1NetworkSecurityZonesService, V1TiersService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';

@Component({
  selector: 'app-rule-group-zones-modal',
  templateUrl: './rule-group-zones-modal.component.html',
  styleUrls: ['./rule-group-zones-modal.component.scss'],
})
export class RuleGroupZonesModalComponent implements OnInit {
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
    const dto = Object.assign({}, this.ngx.getModalData('ruleGroupZonesModal') as any);
    this.modalMode = dto.ModalMode;
    this.form.controls.name.enable();
    this.ngx.resetModalData('ruleGroupZonesModal');
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('ruleGroupZonesModal');
    this.reset();
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('ruleGroupZonesModal');
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
