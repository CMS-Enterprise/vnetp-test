import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Vlan, V1NetworkVlansService } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { VlanModalDto } from 'src/app/models/network/vlan-modal-dto';
import { VlanModalHelpText } from 'src/app/helptext/help-text-networking';

@Component({
  selector: 'app-vlan-modal',
  templateUrl: './vlan-modal.component.html',
})
export class VlanModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;
  ModalMode: ModalMode;
  TierId: string;
  VlanId: string;
  vlans: Array<Vlan>;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    public helpText: VlanModalHelpText,
    private vlanService: V1NetworkVlansService,
  ) {}

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const modalVlanObject = {} as Vlan;
    modalVlanObject.name = this.form.value.name;
    modalVlanObject.description = this.form.value.description;

    if (this.ModalMode === ModalMode.Create) {
      modalVlanObject.vlanNumber = this.form.value.vlanNumber;
      modalVlanObject.tierId = this.TierId;
      this.vlanService
        .v1NetworkVlansPost({
          vlan: modalVlanObject,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    } else {
      modalVlanObject.name = null;
      modalVlanObject.vlanNumber = null;
      this.vlanService
        .v1NetworkVlansIdPut({
          id: this.VlanId,
          vlan: modalVlanObject,
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
    this.ngx.close('vlanModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('vlanModal');
    this.reset();
  }

  get f() {
    return this.form.controls;
  }

  private setFormValidators() {}

  getData() {
    const dto = Object.assign({}, this.ngx.getModalData('vlanModal') as VlanModalDto);

    if (dto.TierId) {
      this.TierId = dto.TierId;
    }

    if (!dto.ModalMode) {
      throw Error('Modal Mode not Set.');
    } else {
      this.ModalMode = dto.ModalMode;

      if (this.ModalMode === ModalMode.Edit) {
        this.VlanId = dto.Vlan.id;
      } else {
        this.form.controls.name.enable();
        this.form.controls.vlanNumber.enable();
      }
    }

    const vlan = dto.Vlan;

    if (vlan !== undefined) {
      this.form.controls.name.setValue(vlan.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(vlan.description);
      this.form.controls.vlanNumber.setValue(vlan.vlanNumber);
      this.form.controls.vlanNumber.disable();
    }
    this.ngx.resetModalData('vlanModal');
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      description: ['', Validators.minLength(3)],
      vlanNumber: ['', Validators.compose([Validators.required, Validators.min(1), Validators.max(4094)])],
    });
  }

  public reset() {
    this.submitted = false;
    this.TierId = '';
    this.ngx.resetModalData('vlanModal');
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
    this.setFormValidators();
  }

  ngOnDestroy() {}
}
