import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ExternalRoute,
  ExternalRouteDto,
  ExternalRouteDtoEnvironmentEnum,
  ExternalRouteDtoVrfEnum,
  ExternalRouteEnvironmentEnum,
  ExternalRouteVrfEnum,
} from 'client';
import { V1NetworkScopeFormsWanFormService } from 'client/api/v1NetworkScopeFormsWanForm.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ExternalRouteModalDto } from 'src/app/models/network-scope-forms/external-route-modal.dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import {
  IpAddressAnyValidator,
  IpAddressCidrValidator,
  IpAddressHostNetworkCidrValidator,
  IpAddressIpValidator,
  validateWanFormExternalRouteIp,
} from 'src/app/validators/network-form-validators';

@Component({
  selector: 'app-external-route-modal',
  templateUrl: './external-route-modal.component.html',
  styleUrls: ['./external-route-modal.component.css'],
})
export class ExternalRouteModalComponent implements OnInit {
  public modalMode: ModalMode;
  public form: FormGroup;
  public externalRouteId: string;
  public submitted: boolean;
  public wanFormId: string;

  constructor(
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
    private wanFormService: V1NetworkScopeFormsWanFormService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('externalRouteModal');
    this.reset();
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('externalRouteModal') as ExternalRouteModalDto);
    this.wanFormId = dto.wanFormId;
    this.modalMode = dto.modalMode;
    if (this.modalMode === ModalMode.Edit) {
      this.externalRouteId = dto.externalRoute.id;
    }

    const externalRoute = dto.externalRoute;
    if (externalRoute !== undefined) {
      this.form.controls.ip.setValue(externalRoute.externalRouteIp);
      this.form.controls.description.setValue(externalRoute.description);
      this.form.controls.vrf.setValue(externalRoute.vrf);
      this.form.controls.environment.setValue(externalRoute.environment);
    }
    this.ngx.resetModalData('externalRouteModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('externalRouteModal');
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      ip: [
        '',
        Validators.compose([
          Validators.required,
          IpAddressCidrValidator,
          validateWanFormExternalRouteIp,
          IpAddressHostNetworkCidrValidator,
        ]),
      ],
      description: ['', Validators.compose([Validators.maxLength(500)])],
      vrf: ['', Validators.required],
      environment: ['', Validators.required],
    });
  }

  private createExternalRoute(externalRoute: ExternalRoute): void {
    // TODO: openapi generates two different enums for the same thing, so we need to convert them. must be a way to fix
    const externalRouteVrfToDtoVrf = {
      [ExternalRouteVrfEnum.Appprod]: ExternalRouteDtoVrfEnum.Appprod,
      [ExternalRouteVrfEnum.Appdev]: ExternalRouteDtoVrfEnum.Appdev,
      [ExternalRouteVrfEnum.Dataprod]: ExternalRouteDtoVrfEnum.Dataprod,
      [ExternalRouteVrfEnum.Datadev]: ExternalRouteDtoVrfEnum.Datadev,
      [ExternalRouteVrfEnum.Edcmgmt]: ExternalRouteDtoVrfEnum.Edcmgmt,
    };

    const externalRouteEnvironmnetToDtoEnvironment = {
      [ExternalRouteEnvironmentEnum.Prod]: ExternalRouteDtoEnvironmentEnum.Prod,
      [ExternalRouteEnvironmentEnum.Dev]: ExternalRouteDtoEnvironmentEnum.Dev,
      [ExternalRouteEnvironmentEnum.Val]: ExternalRouteDtoEnvironmentEnum.Val,
      [ExternalRouteEnvironmentEnum.Imp]: ExternalRouteDtoEnvironmentEnum.Imp,
    };

    const externalRouteDtoVrf = externalRouteVrfToDtoVrf[externalRoute.vrf];
    const externalRouteDtoEnvironment = externalRouteEnvironmnetToDtoEnvironment[externalRoute.environment];

    const externalRouteDto: ExternalRouteDto = {
      externalRouteIp: externalRoute.externalRouteIp,
      description: externalRoute.description,
      vrf: externalRouteDtoVrf,
      environment: externalRouteDtoEnvironment,
    };
    this.wanFormService.createExternalRouteWanForm({ wanFormId: this.wanFormId, externalRouteDto: externalRouteDto }).subscribe(() => {
      this.closeModal();
    });
  }

  private editExternalRoute(externalRoute: ExternalRoute): void {
    this.wanFormService
      .updateExternalRouteWanForm({
        externalRouteId: this.externalRouteId,
        wanFormId: this.wanFormId,
        externalRoute: externalRoute,
      })
      .subscribe(() => {
        this.closeModal();
      });
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { ip, description, vrf, environment } = this.form.value;
    const externalRoute = {
      externalRouteIp: ip,
      description,
      vrf,
      environment,
      wanFormId: this.wanFormId,
    } as ExternalRoute;

    if (this.modalMode === ModalMode.Create) {
      this.createExternalRoute(externalRoute);
    } else {
      this.editExternalRoute(externalRoute);
    }
  }
}
