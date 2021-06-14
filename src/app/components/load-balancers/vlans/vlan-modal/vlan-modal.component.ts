import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';
import { LoadBalancerVlan, V1LoadBalancerVlansService } from 'client';
import { VlanModalDto } from './vlan-modal.dto';
import { RangeValidator } from 'src/app/validators/range-validator';

@Component({
  selector: 'app-vlan-modal',
  templateUrl: './vlan-modal.component.html',
})
export class VlanModalComponent implements OnInit {
  public form: FormGroup;
  public submitted: boolean;

  private vlanId: string;
  private modalMode: ModalMode;
  private tierId: string;

  constructor(private formBuilder: FormBuilder, private ngx: NgxSmartModalService, private vlansService: V1LoadBalancerVlansService) {}

  ngOnInit(): void {
    this.buildForm();
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('vlanModal');
    this.submitted = false;
    this.buildForm();
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { name, tag } = this.form.getRawValue();

    const vlan: LoadBalancerVlan = {
      tierId: this.tierId,
      name,
      tag,
    };

    if (this.modalMode === ModalMode.Create) {
      this.createVlan(vlan);
    } else {
      this.updateVlan(vlan);
    }
  }

  public getData(): void {
    const dto: VlanModalDto = Object.assign({}, this.ngx.getModalData('vlanModal'));
    const { tierId, vlan } = dto;
    this.tierId = tierId;
    this.modalMode = vlan ? ModalMode.Edit : ModalMode.Create;

    if (this.modalMode === ModalMode.Edit) {
      const { name, tag, id } = vlan;
      this.vlanId = id;

      this.form.controls.name.disable();
      this.form.controls.tag.disable();

      this.form.controls.name.setValue(name);
      this.form.controls.tag.setValue(tag);
    } else {
      this.form.controls.name.enable();
      this.form.controls.tag.enable();
    }
    this.ngx.resetModalData('vlanModal');
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      tag: ['', Validators.compose([Validators.required, RangeValidator(1, 4094)])],
    });
  }

  private createVlan(loadBalancerVlan: LoadBalancerVlan): void {
    this.vlansService.createOneLoadBalancerVlan({ loadBalancerVlan }).subscribe(
      () => this.closeModal(),
      () => {},
    );
  }

  private updateVlan(loadBalancerVlan: LoadBalancerVlan): void {
    loadBalancerVlan.tierId = null;
    this.vlansService
      .updateOneLoadBalancerVlan({
        id: this.vlanId,
        loadBalancerVlan,
      })
      .subscribe(
        () => this.closeModal(),
        () => {},
      );
  }
}
