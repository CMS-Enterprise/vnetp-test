import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  LoadBalancerSelfIp,
  LoadBalancerVlan,
  Tier,
  V1LoadBalancerSelfIpsService,
  V1LoadBalancerVlansService,
  V1TiersService,
} from 'client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';
import { SelfIpModalDto } from './self-ip-modal.dto';
import { IpAddressIpValidator } from 'src/app/validators/network-form-validators';

@Component({
  selector: 'app-self-ip-modal',
  templateUrl: './self-ip-modal.component.html',
})
export class SelfIpModalComponent implements OnInit {
  public availableVlans: LoadBalancerVlan[] = [];
  public form: FormGroup;
  public submitted: boolean;

  private selfIpId: string;
  private modalMode: ModalMode;
  private tierId: string;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private selfIpService: V1LoadBalancerSelfIpsService,
    private vlansService: V1LoadBalancerVlansService,
    private tiersService: V1TiersService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('selfIpModal');
    this.submitted = false;
    this.buildForm();
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { ipAddress, name, loadBalancerVlanId } = this.form.value;

    const selfIp: LoadBalancerSelfIp = {
      tierId: this.tierId,
      ipAddress,
      loadBalancerVlanId,
      name,
    };

    if (this.modalMode === ModalMode.Create) {
      this.createSelfIp(selfIp);
    } else {
      this.updateSelfIp(selfIp);
    }
  }

  public getData(): void {
    const dto: SelfIpModalDto = Object.assign({}, this.ngx.getModalData('selfIpModal'));
    const { selfIp, tierId } = dto;
    this.tierId = tierId;
    this.modalMode = selfIp ? ModalMode.Edit : ModalMode.Create;

    if (this.modalMode === ModalMode.Edit) {
      const { ipAddress, name, loadBalancerVlanId, id } = selfIp;
      this.selfIpId = id;

      this.form.controls.name.disable();
      this.form.controls.ipAddress.disable();
      this.form.controls.loadBalancerVlanId.disable();

      this.form.controls.ipAddress.setValue(ipAddress);
      this.form.controls.name.setValue(name);
      this.form.controls.loadBalancerVlanId.setValue(loadBalancerVlanId);
    } else {
      this.form.controls.name.enable();
      this.form.controls.ipAddress.enable();
      this.form.controls.loadBalancerVlanId.enable();
    }

    this.loadVlans();
    this.ngx.resetModalData('selfIpModal');
  }

  public loadVlans(): void {
    this.vlansService
      .getManyLoadBalancerVlan({
        filter: [`tierId||eq||${this.tierId}`],
        // review what to do in this scenario. currently it is a unique issue but
        // if we carry this functionality over to LB-pools it will share the same issue
        perPage: 10000,
        page: 1,
      })
      .subscribe(response => {
        this.availableVlans = response.data as LoadBalancerVlan[];
      });
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      ipAddress: ['', Validators.compose([Validators.required, IpAddressIpValidator])],
      loadBalancerVlanId: ['', Validators.required],
    });
  }

  private createSelfIp(loadBalancerSelfIp: LoadBalancerSelfIp): void {
    this.selfIpService.createOneLoadBalancerSelfIp({ loadBalancerSelfIp }).subscribe(
      () => this.closeModal(),
      () => {},
    );
  }

  private updateSelfIp(loadBalancerSelfIp: LoadBalancerSelfIp): void {
    loadBalancerSelfIp.tierId = null;
    this.selfIpService
      .updateOneLoadBalancerSelfIp({
        id: this.selfIpId,
        loadBalancerSelfIp,
      })
      .subscribe(
        () => this.closeModal(),
        () => {},
      );
  }
}
