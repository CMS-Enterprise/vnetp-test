import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { V1NetworkSubnetsService, Subnet, Vlan } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { SubnetModalDto } from 'src/app/models/network/subnet-modal-dto';
import { SubnetModalHelpText } from 'src/app/helptext/help-text-networking';
import {
  ValidateIpv4CidrAddress,
  ValidateIpv4Address,
} from 'src/app/validators/network-form-validators';

@Component({
  selector: 'app-subnet-modal',
  templateUrl: './subnet-modal.component.html',
})
export class SubnetModalComponent implements OnInit, OnDestroy {
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
    private subnetService: V1NetworkSubnetsService,
  ) {}

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const modalSubnetObject = {} as Subnet;
    modalSubnetObject.name = this.form.value.name;
    modalSubnetObject.description = this.form.value.description;
    modalSubnetObject.network = this.form.value.network;
    modalSubnetObject.gateway = this.form.value.gateway;

    if (this.ModalMode === ModalMode.Create) {
      modalSubnetObject.tierId = this.TierId;
      modalSubnetObject.vlanId = this.form.value.vlan;
      this.subnetService
        .v1NetworkSubnetsPost({
          subnet: modalSubnetObject,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    } else {
      modalSubnetObject.name = null;
      modalSubnetObject.network = null;
      modalSubnetObject.gateway = null;
      modalSubnetObject.tierId = null;
      modalSubnetObject.vlanId = null;
      this.subnetService
        .v1NetworkSubnetsIdPut({
          id: this.SubnetId,
          subnet: modalSubnetObject,
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
    this.ngx.close('subnetModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('subnetModal');
    this.reset();
  }

  get f() {
    return this.form.controls;
  }

  private setFormValidators() {}

  getData() {
    const dto = Object.assign(
      {},
      this.ngx.getModalData('subnetModal') as SubnetModalDto,
    );

    if (dto.TierId) {
      this.TierId = dto.TierId;
    }

    if (!dto.ModalMode) {
      throw Error('Modal Mode not Set.');
    } else {
      this.ModalMode = dto.ModalMode;

      if (this.ModalMode === ModalMode.Edit) {
        this.SubnetId = dto.Subnet.id;
      } else {
        this.form.controls.name.enable();
        this.form.controls.vlan.enable();
        this.form.controls.network.enable();
        this.form.controls.gateway.enable();
      }
    }

    this.vlans = dto.Vlans.filter(v => !v.deletedAt);
    const subnet = dto.Subnet;

    if (subnet !== undefined) {
      this.form.controls.name.setValue(subnet.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(subnet.description);
      this.form.controls.vlan.setValue(subnet.vlanId);
      this.form.controls.vlan.disable();
      this.form.controls.network.setValue(subnet.network);
      this.form.controls.network.disable();
      this.form.controls.gateway.setValue(subnet.gateway);
      this.form.controls.gateway.disable();
    }
    this.ngx.resetModalData('subnetModal');
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.minLength(3)],
      network: [
        '',
        Validators.compose([Validators.required, ValidateIpv4CidrAddress]),
      ],
      gateway: [
        '',
        Validators.compose([Validators.required, ValidateIpv4Address]),
      ],
      vlan: ['', Validators.required],
    });
  }

  public reset() {
    this.submitted = false;
    this.TierId = '';
    this.SubnetId = '';
    this.ngx.resetModalData('subnetModal');
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
    this.setFormValidators();
  }

  ngOnDestroy() {}
}
