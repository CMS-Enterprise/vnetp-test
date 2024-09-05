import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { IpAddressAnyValidator } from '../../../../../validators/network-form-validators';
import { ExternalRoute, V1RuntimeDataExternalRouteService } from '../../../../../../../client';

@Component({
  selector: 'app-route-table-modal',
  templateUrl: './route-table-modal.component.html',
  styleUrl: './route-table-modal.component.css',
})
export class ExternalRouteModalComponent {
  public form: FormGroup;
  public submitted: boolean;
  public wanFormId: string;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private externalRouteService: V1RuntimeDataExternalRouteService,
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
      prefixLength: ['', Validators.compose([Validators.required, Validators.min(0), Validators.max(32)])],
      metric: ['', Validators.required],
      vrf: ['', Validators.required],
    });
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { network, prefixLength, vrf, metric } = this.form.value;
    const externalRoute = {
      network,
      prefixLength,
      vrf,
      metric,
    } as ExternalRoute;

    this.externalRouteService.createOneExternalRoute({ externalRoute }).subscribe(() => {
      this.closeModal();
    });
  }
}
