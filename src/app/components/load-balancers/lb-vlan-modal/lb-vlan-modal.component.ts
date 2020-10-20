import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { V1LoadBalancerVlansService, LoadBalancerVlan } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';
import { LoadBalancerVlanModalDto } from 'src/app/models/network/lb-vlan-modal-dto';

@Component({
  selector: 'app-load-balancer-vlan-modal',
  templateUrl: './lb-vlan-modal.component.html',
})
export class LoadBalancerVlanModalComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;
  TierId: string;
  ModalMode: ModalMode;
  Vlan: LoadBalancerVlan;
  VlanId: string;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder, private vlanService: V1LoadBalancerVlansService) {}

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const vlan = {} as LoadBalancerVlan;
    vlan.name = this.form.controls.name.value;
    vlan.tag = this.form.controls.tag.value;

    if (this.ModalMode === ModalMode.Create) {
      vlan.tierId = this.TierId;
      this.vlanService
        .v1LoadBalancerVlansPost({
          loadBalancerVlan: vlan,
        })
        .subscribe(
          () => {
            this.closeModal();
          },
          () => {},
        );
    } else {
      this.vlanService
        .v1LoadBalancerVlansIdPut({
          id: this.VlanId,
          loadBalancerVlan: vlan,
        })
        .subscribe(
          () => {
            this.closeModal();
          },
          () => {},
        );
    }
  }

  private closeModal() {
    this.ngx.close('loadBalancerVlanModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('loadBalancerVlanModal');
    this.reset();
  }

  get f() {
    return this.form.controls;
  }

  getData() {
    const dto = this.ngx.getModalData('loadBalancerVlanModal') as LoadBalancerVlanModalDto;

    if (!dto.ModalMode) {
      throw Error('Modal Mode not Set.');
    } else {
      this.ModalMode = dto.ModalMode;

      if (this.ModalMode === ModalMode.Edit) {
        this.VlanId = dto.Vlan.id;
      } else {
        this.form.controls.name.enable();
        this.form.controls.tag.enable();
      }
    }

    this.TierId = dto.TierId;
    const vlan = dto.Vlan;

    if (vlan !== undefined) {
      this.form.controls.name.setValue(dto.Vlan.name);
      this.form.controls.name.disable();
      this.form.controls.tag.setValue(dto.Vlan.tag);
      this.form.controls.tag.disable();
    }
    this.ngx.resetModalData('loadBalancerVlanModal');
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100), NameValidator])],
      tag: ['', Validators.compose([Validators.required, Validators.min(1), Validators.max(4094)])],
    });
  }

  public reset() {
    this.submitted = false;
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }
}
