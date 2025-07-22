import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ExternalRoute, V1NetworkScopeFormsWanFormExternalRoutesService } from '../../../../../../client';
import { IpAddressAnyValidator } from '../../../../validators/network-form-validators';

@Component({
  selector: 'app-external-route-modal',
  templateUrl: './external-route-modal.component.html',
  styleUrl: './external-route-modal.component.css',
})
export class ExternalRouteModalComponent {
  public form: FormGroup;
  public submitted: boolean;
  public wanFormId: string;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private externalRouteService: V1NetworkScopeFormsWanFormExternalRoutesService,
  ) {}

  public ngOnInit(): void {
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
    const dto = Object.assign({}, this.ngx.getModalData('externalRouteModal')) as { wanFormId: string };
    this.wanFormId = dto.wanFormId;
    this.ngx.resetModalData('externalRouteModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('externalRouteModal');
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      network: ['', Validators.compose([Validators.required, IpAddressAnyValidator])],
      externalVrf: ['', Validators.required],
    });
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { network, vrf } = this.form.value;
    const externalRoute = {
      network,
      externalVrf: vrf,
      wanFormId: this.wanFormId,
    } as ExternalRoute;

    this.externalRouteService.createOneExternalRoute({ externalRoute }).subscribe(() => {
      this.closeModal();
    });
  }
}
