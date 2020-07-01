import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { V1NetworkSubnetsService, Subnet, Vlan } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { SubnetModalDto } from 'src/app/models/network/subnet-modal-dto';
import { SubnetModalHelpText } from 'src/app/helptext/help-text-networking';
import { IpAddressCidrValidator, IpAddressIpValidator } from 'src/app/validators/network-form-validators';
import { NameValidator } from 'src/app/validators/name-validator';

@Component({
  selector: 'app-subnet-modal',
  templateUrl: './subnet-modal.component.html',
})
export class SubnetModalComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;
  ModalMode: ModalMode;
  TierId: string;
  SubnetId: string;
  vlans: Vlan[];

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    public helpText: SubnetModalHelpText,
    private subnetService: V1NetworkSubnetsService,
  ) {}

  get f() {
    return this.form.controls;
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { name, description, network, gateway } = this.form.value;
    const subnet = {
      name,
      description,
      network,
      gateway,
    } as Subnet;

    if (this.ModalMode === ModalMode.Create) {
      this.createSubnet(subnet);
    } else {
      this.updateSubnet(subnet);
    }
  }

  public closeModal(): void {
    this.ngx.close('subnetModal');
    this.reset();
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('subnetModal') as SubnetModalDto);

    if (dto.TierId) {
      this.TierId = dto.TierId;
    }

    if (!dto.ModalMode) {
      throw Error('Modal Mode not Set.');
    }

    this.ModalMode = dto.ModalMode;

    if (this.ModalMode === ModalMode.Edit) {
      this.SubnetId = dto.Subnet.id;
    } else {
      this.form.controls.name.enable();
      this.form.controls.vlan.enable();
      this.form.controls.network.enable();
      this.form.controls.gateway.enable();
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

  public reset(): void {
    this.submitted = false;
    this.TierId = '';
    this.SubnetId = '';
    this.ngx.resetModalData('subnetModal');
    this.buildForm();
  }

  private createSubnet(subnet: Subnet): void {
    subnet.tierId = this.TierId;
    subnet.vlanId = this.form.value.vlan;
    this.subnetService
      .v1NetworkSubnetsPost({
        subnet,
      })
      .subscribe(
        data => {
          this.closeModal();
        },
        error => {},
      );
  }

  private updateSubnet(subnet: Subnet): void {
    subnet.name = null;
    subnet.network = null;
    subnet.gateway = null;
    subnet.tierId = null;
    subnet.vlanId = null;
    this.subnetService
      .v1NetworkSubnetsIdPut({
        id: this.SubnetId,
        subnet,
      })
      .subscribe(
        data => {
          this.closeModal();
        },
        error => {},
      );
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100), NameValidator])],
      description: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(500)])],
      network: ['', Validators.compose([Validators.required, IpAddressCidrValidator])],
      gateway: ['', Validators.compose([Validators.required, IpAddressIpValidator])],
      vlan: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.buildForm();
  }
}
