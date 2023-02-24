import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppCentricSubnet, V2AppCentricAppCentricSubnetsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { AppcentricSubnetDto } from 'src/app/models/appcentric/appcentric-subnet-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';
import { IpAddressCidrValidator } from 'src/app/validators/network-form-validators';

@Component({
  selector: 'app-subnets-edit-modal',
  templateUrl: './subnets-edit-modal.component.html',
  styleUrls: ['./subnets-edit-modal.component.css'],
})
export class SubnetsEditModalComponent implements OnInit {
  public subnetId: string;
  public form: FormGroup;
  public submitted: boolean;
  public modalMode: ModalMode;
  @Input() public bridgeDomainId: string;
  @Input() public tenantId: string;

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
    this.ngx.close('subnetsEditModal');
    this.reset();
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('subnetsEditModal') as AppcentricSubnetDto);
    const subnet = dto.subnet;

    this.modalMode = dto.modalMode;

    if (this.modalMode === ModalMode.Edit) {
      this.subnetId = dto.subnet.id;
    } else {
      this.form.controls.name.enable();
      this.form.controls.treatAsVirtualIpAddress.setValue(true);
      this.form.controls.primaryIpAddress.setValue(false);
      this.form.controls.advertisedExternally.setValue(false);
      this.form.controls.preferred.setValue(false);
      this.form.controls.sharedBetweenVrfs.setValue(false);
      this.form.controls.ipDataPlaneLearning.setValue(true);
    }

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
      this.form.controls.primaryIpAddress.setValue(subnet.primaryIpAddress);
    }
    this.ngx.resetModalData('subnetsEditModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('subnetsEditModal');
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      alias: ['', Validators.compose([Validators.maxLength(100)])],
      description: ['', Validators.compose([Validators.maxLength(500)])],
      gatewayIp: ['', Validators.compose([Validators.required, IpAddressCidrValidator])],
      treatAsVirtualIpAddress: [null],
      primaryIpAddress: ['', Validators.required],
      advertisedExternally: [null],
      preferred: [null],
      sharedBetweenVrfs: [null],
      ipDataPlaneLearning: [null],
    });
  }

  private createSubnets(appCentricSubnet: AppCentricSubnet): void {
    this.subnetsService.createAppCentricSubnet({ appCentricSubnet }).subscribe(
      () => {},
      () => {},
      () => this.closeModal(),
    );
  }

  private editSubnet(appCentricSubnet: AppCentricSubnet): void {
    appCentricSubnet.name = null;
    appCentricSubnet.gatewayIp = null;
    appCentricSubnet.tenantId = null;
    appCentricSubnet.bridgeDomainId = null;
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

    const bridgeDomainId = this.bridgeDomainId;
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
      bridgeDomainId,
      tenantId,
    } as AppCentricSubnet;

    if (this.modalMode === ModalMode.Create) {
      this.createSubnets(subnet);
    } else {
      this.editSubnet(subnet);
    }
  }
}
