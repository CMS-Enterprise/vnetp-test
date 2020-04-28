import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadBalancerSelfIp, V1LoadBalancerSelfIpsService, V1TiersService, LoadBalancerVlan, V1LoadBalancerVlansService } from 'api_client';
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

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const selfIp = {} as LoadBalancerSelfIp;
    selfIp.name = this.form.controls.name.value;
    selfIp.ipAddress = this.form.controls.ipAddress.value;
    selfIp.loadBalancerVlanId = this.form.controls.vlan.value;

    if (this.ModalMode === ModalMode.Create) {
      selfIp.tierId = this.TierId;
      this.selfIpService
        .v1LoadBalancerSelfIpsPost({
          loadBalancerSelfIp: selfIp,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    } else {
      this.selfIpService
        .v1LoadBalancerSelfIpsIdPut({
          id: this.SelfIpId,
          loadBalancerSelfIp: selfIp,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
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

  get f() {
    return this.form.controls;
  }

  getData() {
    const dto = this.ngx.getModalData('loadBalancerSelfIpModal') as LoadBalancerSelfIpModalDto;
    if (!dto.ModalMode) {
      throw Error('Modal Mode not Set.');
    } else {
      this.ModalMode = dto.ModalMode;

      if (this.ModalMode === ModalMode.Edit) {
        this.SelfIpId = dto.SelfIp.id;
      } else {
        this.form.controls.name.enable();
        this.form.controls.ipAddress.enable();
      }
    }

    this.TierId = dto.TierId;
    const selfIp = dto.SelfIp;
    this.getVlans();

    if (selfIp !== undefined) {
      this.form.controls.name.setValue(dto.SelfIp.name);
      this.form.controls.name.disable();
      this.form.controls.ipAddress.setValue(dto.SelfIp.ipAddress);
      this.form.controls.ipAddress.disable();
      this.form.controls.vlan.setValue(dto.SelfIp.loadBalancerVlanId);
    }
    this.ngx.resetModalData('loadBalancerSelfIpModal');
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100), NameValidator])],
      ipAddress: ['', Validators.compose([IpAddressIpValidator])],
      vlan: [''],
    });
  }

  public reset() {
    this.submitted = false;
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
    this.getVlans();
  }
}
