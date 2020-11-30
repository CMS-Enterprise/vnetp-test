import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadBalancerSelfIp, V1LoadBalancerSelfIpsService, LoadBalancerVlan, V1LoadBalancerVlansService } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';
import { LoadBalancerSelfIpModalDto } from 'src/app/models/network/lb-self-ip-modal-dto';
import { IpAddressIpValidator } from 'src/app/validators/network-form-validators';

@Component({
  selector: 'app-load-balancer-self-ip-modal',
  templateUrl: './lb-self-ip-modal.component.html',
})
export class LoadBalancerSelfIpModalComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;
  TierId: string;
  ModalMode: ModalMode;
  selfIp: LoadBalancerSelfIp;
  SelfIpId: string;
  availableVlans: LoadBalancerVlan[];

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private selfIpService: V1LoadBalancerSelfIpsService,
    private vlansService: V1LoadBalancerVlansService,
  ) {}

  get f() {
    return this.form.controls;
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const selfIp: LoadBalancerSelfIp = {
      name: this.form.controls.name.value,
      ipAddress: this.form.controls.ipAddress.value,
      loadBalancerVlanId: this.form.controls.vlan.value,
      tierId: this.TierId,
    };

    if (this.ModalMode === ModalMode.Create) {
      this.createSelfIp(selfIp);
    } else {
      this.updateSelfIp(this.SelfIpId, selfIp);
    }
  }

  getVlans() {
    this.vlansService
      .v1LoadBalancerVlansGet({
        filter: `tierId||eq||${this.TierId}`,
      })
      .subscribe(data => {
        this.availableVlans = data;
      });
  }

  private closeModal() {
    this.ngx.close('loadBalancerSelfIpModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('loadBalancerSelfIpModal');
    this.reset();
  }

  getData() {
    const dto = this.ngx.getModalData('loadBalancerSelfIpModal') as LoadBalancerSelfIpModalDto;

    this.ModalMode = dto.ModalMode;
    if (this.ModalMode === ModalMode.Edit) {
      this.SelfIpId = dto.SelfIp.id;
    } else {
      this.form.controls.name.enable();
      this.form.controls.ipAddress.enable();
    }

    this.TierId = dto.TierId;
    this.getVlans();

    if (dto.SelfIp !== undefined) {
      this.form.controls.name.setValue(dto.SelfIp.name);
      this.form.controls.name.disable();
      this.form.controls.ipAddress.setValue(dto.SelfIp.ipAddress);
      this.form.controls.ipAddress.disable();
      this.form.controls.vlan.setValue(dto.SelfIp.loadBalancerVlanId);
    }
    this.ngx.resetModalData('loadBalancerSelfIpModal');
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      ipAddress: ['', Validators.compose([Validators.required, IpAddressIpValidator])],
      vlan: ['', Validators.required],
    });
  }

  public reset(): void {
    this.submitted = false;
    this.buildForm();
  }

  private createSelfIp(loadBalancerSelfIp: LoadBalancerSelfIp): void {
    this.selfIpService.v1LoadBalancerSelfIpsPost({ loadBalancerSelfIp }).subscribe(
      () => this.closeModal(),
      () => {},
    );
  }

  private updateSelfIp(id: string, loadBalancerSelfIp: LoadBalancerSelfIp): void {
    loadBalancerSelfIp.tierId = null;
    this.selfIpService
      .v1LoadBalancerSelfIpsIdPut({
        id,
        loadBalancerSelfIp,
      })
      .subscribe(
        () => this.closeModal(),
        () => {},
      );
  }

  ngOnInit() {
    this.buildForm();
  }
}
