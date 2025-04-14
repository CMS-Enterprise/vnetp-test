import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Datacenter, V1DatacentersService, V1NetworkSecurityZonesService, V1TiersService, Zone } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import ObjectUtil from 'src/app/utils/ObjectUtil';

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
  datacenters: Datacenter[];

  constructor(
    private tierService: V1TiersService,
    private zoneService: V1NetworkSecurityZonesService,
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
      description: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(500)])],
      tier: ['', Validators.required],
    });
  }

  private createZone(zone: Zone): void {
    this.zoneService.createOneZone({ zone }).subscribe(() => {
      this.closeModal();
    });
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { name, description, tier } = this.form.value;
    const zone = {
      name,
      description,
      tierId: tier,
    };
    if (this.modalMode === ModalMode.Create) {
      this.createZone(zone);
    }
  }
}
