import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Tier, V1TiersService, V1TierGroupsService, TierGroup } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TierModalDto } from 'src/app/models/network/tier-modal-dto';
import { NameValidator } from 'src/app/validators/name-validator';

@Component({
  selector: 'app-tier-modal',
  templateUrl: './tier-modal.component.html',
})
export class TierModalComponent implements OnInit {
  public DatacenterId: string;
  public ModalMode: ModalMode;
  public TierId: string;
  public form: FormGroup;
  public submitted: boolean;
  public tierGroups: TierGroup[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
    private tierGroupService: V1TierGroupsService,
    private tierService: V1TiersService,
  ) {}

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('tierModal');
    this.reset();
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('tierModal') as TierModalDto);

    if (dto.DatacenterId) {
      this.DatacenterId = dto.DatacenterId;
    }

    this.getTierGroups();

    this.ModalMode = dto.ModalMode;
    if (this.ModalMode === ModalMode.Edit) {
      this.TierId = dto.Tier.id;
    } else {
      this.form.controls.name.enable();
    }

    const tier = dto.Tier;
    if (tier !== undefined) {
      this.form.controls.name.setValue(tier.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(tier.description);
      this.form.controls.tierGroup.setValue(tier.tierGroupId);
      this.form.controls.tierType.setValue(tier.tierType);
      this.form.controls.tierClass.setValue(tier.tierClass);
    }
    this.ngx.resetModalData('tierModal');
  }

  public reset(): void {
    this.submitted = false;
    this.DatacenterId = '';
    this.tierGroups = [];
    this.ngx.resetModalData('tierModal');
    this.buildForm();
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { name, description, tierGroup, tierClass, tierType } = this.form.value;
    const tier = {
      name,
      description,
      tierType: tierType || null,
      tierClass: tierClass || null,
      tierGroupId: tierGroup || null,
      datacenterId: this.DatacenterId,
    } as Tier;

    if (this.ModalMode === ModalMode.Create) {
      this.createTier(tier);
    } else {
      this.editTier(tier);
    }
  }

  private getTierGroups(): void {
    this.tierGroupService.v1TierGroupsGet({ filter: `datacenterId||eq||${this.DatacenterId}` }).subscribe(data => {
      this.tierGroups = data;
    });
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      description: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(500)])],
      tierGroup: [null],
      tierClass: [null],
      tierType: [null],
    });
  }

  private createTier(tier: Tier): void {
    this.tierService.v1TiersPost({ tier }).subscribe(
      () => {
        this.closeModal();
      },
      () => {},
    );
  }

  private editTier(tier: Tier): void {
    tier.name = null;
    tier.datacenterId = null;
    this.tierService
      .v1TiersIdPut({
        id: this.TierId,
        tier,
      })
      .subscribe(
        () => {
          this.closeModal();
        },
        () => {},
      );
  }

  ngOnInit() {
    this.buildForm();
  }
}
