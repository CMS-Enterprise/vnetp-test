import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  Tier,
  V1TiersService,
  V1TierGroupsService,
  TierGroup,
} from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TierModalHelpText } from 'src/app/helptext/help-text-networking';
import { TierModalDto } from 'src/app/models/network/tier-modal-dto';

@Component({
  selector: 'app-tier-modal',
  templateUrl: './tier-modal.component.html',
})
export class TierModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;
  ModalMode: ModalMode;
  DatacenterId: string;
  TierId: string;
  tierGroups: Array<TierGroup>;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    public helpText: TierModalHelpText,
    private tierService: V1TiersService,
    private tierGroupService: V1TierGroupsService,
  ) {}

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const modalTierObject = {} as Tier;
    modalTierObject.name = this.form.value.name;
    modalTierObject.description = this.form.value.description;
    modalTierObject.datacenterId = this.DatacenterId;
    modalTierObject.tierGroupId = this.form.value.tierGroup || null;
    modalTierObject.tierType = this.form.value.tierType || null;

    if (this.ModalMode === ModalMode.Create) {
      this.tierService
        .v1TiersPost({
          tier: modalTierObject,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    } else {
      modalTierObject.name = null;
      modalTierObject.datacenterId = null;
      this.tierService
        .v1TiersIdPut({
          id: this.TierId,
          tier: modalTierObject,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    }
  }

  private closeModal() {
    this.ngx.close('tierModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('tierModal');
    this.reset();
  }

  get f() {
    return this.form.controls;
  }

  private setFormValidators() {}

  getData() {
    const dto = Object.assign(
      {},
      this.ngx.getModalData('tierModal') as TierModalDto,
    );

    if (dto.DatacenterId) {
      this.DatacenterId = dto.DatacenterId;
    }

    this.getTierGroups();

    if (!dto.ModalMode) {
      throw Error('Modal Mode not Set.');
    } else {
      this.ModalMode = dto.ModalMode;

      if (this.ModalMode === ModalMode.Edit) {
        this.TierId = dto.Tier.id;
      } else {
        this.form.controls.name.enable();
      }
    }

    const tier = dto.Tier;

    if (tier !== undefined) {
      this.form.controls.name.setValue(tier.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(tier.description);
      this.form.controls.tierGroup.setValue(tier.tierGroupId);
      this.form.controls.tierType.setValue(tier.tierType);
    }
    this.ngx.resetModalData('tierModal');
  }

  private getTierGroups() {
    this.tierGroupService
      .v1TierGroupsGet({ filter: `datacenterId||eq||${this.DatacenterId}` })
      .subscribe(data => {
        this.tierGroups = data;
      });
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: [
        '',
        Validators.compose([Validators.required, Validators.minLength(3)]),
      ],
      description: ['', Validators.minLength(3)],
      tierGroup: [null],
      tierType: [null],
    });
  }

  public reset() {
    this.submitted = false;
    this.DatacenterId = '';
    this.tierGroups = [];
    this.ngx.resetModalData('tierModal');
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
    this.setFormValidators();
  }

  ngOnDestroy() {}
}
