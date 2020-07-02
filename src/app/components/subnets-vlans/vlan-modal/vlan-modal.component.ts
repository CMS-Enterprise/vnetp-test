import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Vlan, V1NetworkVlansService } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { VlanModalDto } from 'src/app/models/network/vlan-modal-dto';
import { VlanModalHelpText } from 'src/app/helptext/help-text-networking';
import { NameValidator } from 'src/app/validators/name-validator';

@Component({
  selector: 'app-vlan-modal',
  templateUrl: './vlan-modal.component.html',
})
export class VlanModalComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;
  ModalMode: ModalMode;
  TierId: string;
  VlanId: string;
  vlans: Vlan[];

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    public helpText: VlanModalHelpText,
    private vlanService: V1NetworkVlansService,
  ) {}

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('vlanModal');
    this.reset();
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('vlanModal') as VlanModalDto);

    if (dto.TierId) {
      this.TierId = dto.TierId;
    }

    if (!dto.ModalMode) {
      throw Error('Modal Mode not Set.');
    }

    this.ModalMode = dto.ModalMode;

    if (this.ModalMode === ModalMode.Edit) {
      this.VlanId = dto.Vlan.id;
    } else {
      this.form.controls.name.enable();
      this.form.controls.vlanNumber.enable();
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

  public reset() {
    this.submitted = false;
    this.TierId = '';
    this.ngx.resetModalData('vlanModal');
    this.buildForm();
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { name, description } = this.form.value;
    const vlan = { name, description } as Vlan;

    if (this.ModalMode === ModalMode.Create) {
      this.createVlan(vlan);
    } else {
      this.updateVlan(vlan);
    }
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100), NameValidator])],
      description: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(100)])],
      vlanNumber: ['', Validators.compose([Validators.required, Validators.min(1), Validators.max(4094)])],
    });
  }

  private createVlan(vlan: Vlan): void {
    vlan.vlanNumber = this.form.value.vlanNumber;
    vlan.tierId = this.TierId;
    this.vlanService.v1NetworkVlansPost({ vlan }).subscribe(
      data => {
        this.closeModal();
      },
      error => {},
    );
  }

  private updateVlan(vlan: Vlan): void {
    vlan.name = null;
    vlan.vlanNumber = null;
    this.vlanService.v1NetworkVlansIdPut({ id: this.VlanId, vlan }).subscribe(
      data => {
        this.closeModal();
      },
      error => {},
    );
  }

  ngOnInit() {
    this.buildForm();
  }
}
