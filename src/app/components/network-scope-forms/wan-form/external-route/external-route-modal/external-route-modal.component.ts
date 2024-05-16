import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
// eslint-disable-next-line max-len
import { V1NetworkScopeFormsWanFormExternalRouteService } from '../../../../../../../client/api/v1NetworkScopeFormsWanFormExternalRoute.service';
import { ExternalRoute } from '../../../../../../../client/model/externalRoute';
import { ExternalRouteModalDto } from '../../../../../models/network-scope-forms/external-route-modal.dto';
import { ModalMode } from '../../../../../models/other/modal-mode';
import { DatacenterContextService } from '../../../../../services/datacenter-context.service';
import {
  IpAddressCidrValidator,
  validateWanFormExternalRouteIp,
  IpAddressHostNetworkCidrValidator,
} from '../../../../../validators/network-form-validators';

@Component({
  selector: 'app-external-route-modal',
  templateUrl: './external-route-modal.component.html',
  styleUrls: ['./external-route-modal.component.css'],
})
export class ExternalRouteModalComponent implements OnInit, OnDestroy {
  public modalMode: ModalMode;
  public form: FormGroup;
  public externalRouteId: string;
  public submitted: boolean;
  public wanFormId: string;
  private datacenterId: string;
  private datacenterSubscription: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
    private externalRouteService: V1NetworkScopeFormsWanFormExternalRouteService,
    private datacenterContextService: DatacenterContextService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.datacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.datacenterId = cd.id;
      }
    });
  }

  ngOnDestroy(): void {
    this.datacenterSubscription.unsubscribe();
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
      datacenterId: this.datacenterId,
    } as ExternalRoute;

    if (this.modalMode === ModalMode.Create) {
      this.externalRouteService.createOneExternalRoute({ externalRoute }).subscribe(() => {
        this.closeModal();
      });
    } else {
      delete externalRoute.wanFormId;
      this.externalRouteService
        .updateOneExternalRoute({
          id: this.externalRouteId,
          externalRoute,
        })
        .subscribe(() => {
          this.closeModal();
        });
    }
  }
}
