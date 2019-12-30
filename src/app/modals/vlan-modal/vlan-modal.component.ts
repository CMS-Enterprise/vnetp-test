import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Vlan, V1NetworkVlansService } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { VlanModalDto } from 'src/app/models/network/vlan-modal-dto';
import { SubnetModalHelpText } from 'src/app/helptext/help-text-networking';

@Component({
  selector: 'app-vlan-modal',
  templateUrl: './vlan-modal.component.html',
})
export class VlanModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;
  ModalMode: ModalMode;
  TierId: string;
  SubnetId: string;
  vlans: Array<Vlan>;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    public helpText: SubnetModalHelpText,
    private vlanService: V1NetworkVlansService,
  ) {}

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const modalSubnetObject = {} as Vlan;
    modalSubnetObject.name = this.form.value.name;

    if (this.ModalMode === ModalMode.Create) {
      modalSubnetObject.vlanNumber = this.form.value.vlanNumber;
      modalSubnetObject.tierId = this.TierId;
      this.vlanService
        .v1NetworkVlansPost({
          vlan: modalSubnetObject,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    } else {
      modalSubnetObject.name = null;
      modalSubnetObject.vlanNumber = null;
      this.vlanService
        .v1NetworkVlansIdPut({
          id: this.SubnetId,
          vlan: modalSubnetObject,
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
    const dto = Object.assign(
      {},
      this.ngx.getModalData('vlanModal') as VlanModalDto,
    );

    if (dto.TierId) {
      this.TierId = dto.TierId;
    }

    if (!dto.ModalMode) {
      throw Error('Modal Mode not Set.');
    } else {
      this.ModalMode = dto.ModalMode;

      if (this.ModalMode === ModalMode.Edit) {
        this.SubnetId = dto.Vlan.id;
      } else {
        this.form.controls.name.enable();
        this.form.controls.vlanNumber.enable();
      }
    }

    const subnet = dto.Vlan;

    if (subnet !== undefined) {
      this.form.controls.name.setValue(subnet.name);
      this.form.controls.name.disable();
      this.form.controls.vlanNumber.setValue(subnet.vlanNumber);
      this.form.controls.vlanNumber.disable();
    }
    this.ngx.resetModalData('vlanModal');
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      vlanNumber: [
        '',
        Validators.compose([Validators.min(1), Validators.max(4094)]),
      ],
    });
  }

  private reset() {
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
