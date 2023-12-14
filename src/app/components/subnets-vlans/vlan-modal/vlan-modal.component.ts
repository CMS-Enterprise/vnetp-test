import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Vlan, V1NetworkVlansService } from 'client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { VlanModalDto } from 'src/app/models/network/vlan-modal-dto';
import { NameValidator } from 'src/app/validators/name-validator';

@Component({
  selector: 'app-vlan-modal',
  templateUrl: './vlan-modal.component.html',
})
export class VlanModalComponent implements OnInit {
  public ModalMode: ModalMode;
  public TierId: string;
  public VlanId: string;
  public form: UntypedFormGroup;
  public submitted: boolean;
  public vlans: Vlan[];

  constructor(private formBuilder: UntypedFormBuilder, private ngx: NgxSmartModalService, private vlanService: V1NetworkVlansService) {}

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
      this.form.controls.vcdVlanType.setValue(vlan.vcdVlanType);
    }
    this.ngx.resetModalData('vlanModal');
  }

  public reset(): void {
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

    const { name, description, vcdVlanType } = this.form.value;
    const vlan = { name, description, vcdVlanType: vcdVlanType || null } as Vlan;

    if (this.ModalMode === ModalMode.Create) {
      this.createVlan(vlan);
    } else {
      this.updateVlan(vlan);
    }
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      description: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(500)])],
      vcdVlanType: [null],
      vlanNumber: ['', Validators.compose([Validators.required, Validators.min(1), Validators.max(4094)])],
    });
  }

  private createVlan(vlan: Vlan): void {
    vlan.vcdVlanType = this.form.value.vcdVlanType;
    vlan.vlanNumber = this.form.value.vlanNumber;
    vlan.tierId = this.TierId;
    this.vlanService.createOneVlan({ vlan }).subscribe(
      () => {
        this.closeModal();
      },
      () => {},
    );
  }

  private updateVlan(vlan: Vlan): void {
    vlan.name = null;
    vlan.vlanNumber = null;
    this.vlanService.updateOneVlan({ id: this.VlanId, vlan }).subscribe(
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
