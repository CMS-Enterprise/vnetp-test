import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppCentricSubnet, V2AppCentricAppCentricSubnetsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NameValidator } from 'src/app/validators/name-validator';
import { IpAddressCidrValidator } from 'src/app/validators/network-form-validators';

@Component({
  selector: 'app-subnets-edit-modal',
  templateUrl: './subnets-edit-modal.component.html',
  styleUrls: ['./subnets-edit-modal.component.css'],
})
export class SubnetsEditModalComponent implements OnInit {
  @Input() tenantId: string;
  public subnetId: string;
  public form: FormGroup;
  public submitted: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
    private subnetsService: V2AppCentricAppCentricSubnetsService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('vrfModal');
    this.reset();
  }

  public getData(): void {
    const subnet = Object.assign({}, this.ngx.getModalData('subnetsEditModal') as AppCentricSubnet);

    if (subnet !== undefined) {
      this.form.controls.name.setValue(subnet.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(subnet.description);
      this.form.controls.alias.setValue(subnet.alias);
      this.form.controls.gatewayIp.setValue(subnet.gatewayIp);
      this.form.controls.gatewayIp.disable();
      this.form.controls.treatAsVirtualIpAddress.setValue(subnet.treatAsVirtualIpAddress);
      this.form.controls.advertisedExternally.setValue(subnet.advertisedExternally);
      this.form.controls.preferred.setValue(subnet.preferred);
      this.form.controls.sharedBetweenVrfs.setValue(subnet.sharedBetweenVrfs);
      this.form.controls.ipDataPlaneLearning.setValue(subnet.ipDataPlaneLearning);
    }
    this.ngx.resetModalData('subnetEditModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('subnetEditModal');
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      alias: ['', Validators.compose([Validators.maxLength(100)])],
      description: ['', Validators.compose([Validators.maxLength(500)])],
      gatewayIp: ['', Validators.compose([Validators.required, IpAddressCidrValidator])],
      treatAsVirtualIpAddress: [null],
      primaryIpAddress: [null],
      advertisedExternally: [null],
      preferred: [null],
      sharedBetweenVrfs: [null],
      ipDataPlaneLearning: [null],
    });
  }

  private editSubnet(appCentricSubnet: AppCentricSubnet): void {
    appCentricSubnet.name = null;
    this.subnetsService
      .updateAppCentricSubnet({
        uuid: this.subnetId,
        appCentricSubnet,
      })
      .subscribe(
        () => {},
        () => {},
        () => this.closeModal(),
      );
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const {
      name,
      description,
      alias,
      gatewayIp,
      treatAsVirtualIpAddress,
      primaryIpAddress,
      advertisedExternally,
      preferred,
      sharedBetweenVrfs,
      ipDataPlaneLearning,
    } = this.form.value;
    const tenantId = this.tenantId;
    const subnet = {
      name,
      description,
      alias,
      gatewayIp,
      treatAsVirtualIpAddress,
      primaryIpAddress,
      advertisedExternally,
      preferred,
      sharedBetweenVrfs,
      ipDataPlaneLearning,
    } as AppCentricSubnet;

    this.editSubnet(subnet);
  }
}
