import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IpAddressCidrValidator, IpAddressIpValidator } from 'src/app/validators/network-form-validators';
import { StaticRoute, V1NetworkStaticRoutesService } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { StaticRouteModalDto } from 'src/app/models/network/static-route-modal-dto';
import { NameValidator } from 'src/app/validators/name-validator';

@Component({
  selector: 'app-static-route-modal',
  templateUrl: './static-route-modal.component.html',
})
export class StaticRouteModalComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;
  ModalMode: ModalMode;
  TierId: string;
  StaticRouteId: string;

  constructor(
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
    private staticRouteService: V1NetworkStaticRoutesService,
  ) {}

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const modalStaticRoute = {} as StaticRoute;
    modalStaticRoute.metric = this.form.value.metric;

    if (this.ModalMode === ModalMode.Create) {
      modalStaticRoute.name = this.form.value.name;
      modalStaticRoute.tierId = this.TierId;
      modalStaticRoute.destinationNetwork = this.form.value.destinationNetwork;
      modalStaticRoute.nextHop = this.form.value.nextHop;
      this.staticRouteService
        .v1NetworkStaticRoutesPost({
          staticRoute: modalStaticRoute,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    } else {
      this.staticRouteService
        .v1NetworkStaticRoutesIdPut({
          id: this.StaticRouteId,
          staticRoute: modalStaticRoute,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    }
  }

  private closeModal() {
    this.ngx.close('staticRouteModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('staticRouteModal');
    this.reset();
  }

  get f() {
    return this.form.controls;
  }

  getData() {
    const dto = Object.assign({}, this.ngx.getModalData('staticRouteModal') as StaticRouteModalDto);

    if (dto.TierId) {
      this.TierId = dto.TierId;
    }

    if (!dto.ModalMode) {
      throw Error('Modal Mode not Set.');
    } else {
      this.ModalMode = dto.ModalMode;

      if (this.ModalMode === ModalMode.Edit) {
        this.StaticRouteId = dto.StaticRoute.id;
        this.form.controls.name.disable();
        this.form.controls.destinationNetwork.disable();
        this.form.controls.nextHop.disable();
      } else {
        this.form.controls.name.enable();
        this.form.controls.destinationNetwork.enable();
        this.form.controls.nextHop.enable();
      }
    }

    const staticRoute = dto.StaticRoute;

    if (staticRoute !== undefined) {
      this.form.controls.name.setValue(staticRoute.name);
      this.form.controls.destinationNetwork.setValue(staticRoute.destinationNetwork);
      this.form.controls.nextHop.setValue(staticRoute.nextHop);
      this.form.controls.metric.setValue(staticRoute.metric);
    }
    this.ngx.resetModalData('staticRouteModal');
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100), NameValidator])],
      destinationNetwork: ['', Validators.compose([Validators.required, IpAddressCidrValidator])],
      nextHop: ['', Validators.compose([Validators.required, IpAddressIpValidator])],
      metric: ['', Validators.compose([Validators.required, Validators.min(1), Validators.max(255)])],
    });
  }

  public reset() {
    this.submitted = false;
    this.TierId = '';
    this.StaticRouteId = '';
    this.ngx.resetModalData('staticRouteModal');
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }
}
