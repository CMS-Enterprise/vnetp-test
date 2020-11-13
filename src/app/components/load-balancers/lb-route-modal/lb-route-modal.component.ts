import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';
import { LoadBalancerRoute, V1LoadBalancerRoutesService } from 'api_client';
import { LoadBalancerRouteModalDto } from 'src/app/models/network/lb-route-modal-dto';
import { IpAddressCidrValidator, IpAddressIpValidator } from 'src/app/validators/network-form-validators';
import { LoadBalancerRouteModalHelpText } from 'src/app/helptext/help-text-networking';

@Component({
  selector: 'app-load-balancer-route-modal',
  templateUrl: './lb-route-modal.component.html',
})
export class LoadBalancerRouteModalComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;
  TierId: string;
  ModalMode: ModalMode;
  route: LoadBalancerRoute;
  RouteId: string;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private routeService: V1LoadBalancerRoutesService,
    public helpText: LoadBalancerRouteModalHelpText,
  ) {}

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const route = {} as LoadBalancerRoute;
    route.name = this.form.controls.name.value;
    route.destination = this.form.controls.destination.value;
    route.gateway = this.form.controls.gateway.value;

    if (this.ModalMode === ModalMode.Create) {
      route.tierId = this.TierId;
      this.routeService
        .v1LoadBalancerRoutesPost({
          loadBalancerRoute: route,
        })
        .subscribe(
          () => {
            this.closeModal();
          },
          () => {},
        );
    } else {
      this.routeService
        .v1LoadBalancerRoutesIdPut({
          id: this.RouteId,
          loadBalancerRoute: route,
        })
        .subscribe(
          () => {
            this.closeModal();
          },
          () => {},
        );
    }
  }

  private closeModal() {
    this.ngx.close('loadBalancerRouteModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('loadBalancerRouteModal');
    this.reset();
  }

  get f() {
    return this.form.controls;
  }

  getData() {
    const dto = this.ngx.getModalData('loadBalancerRouteModal') as LoadBalancerRouteModalDto;

    this.ModalMode = dto.ModalMode;

    if (this.ModalMode === ModalMode.Edit) {
      this.RouteId = dto.Route.id;
    } else {
      this.form.controls.name.enable();
    }

    this.TierId = dto.TierId;
    const route = dto.Route;

    if (route !== undefined) {
      this.form.controls.name.setValue(dto.Route.name);
      this.form.controls.name.disable();
      this.form.controls.destination.setValue(dto.Route.destination);
      this.form.controls.destination.disable();
      this.form.controls.gateway.setValue(dto.Route.gateway);
      this.form.controls.gateway.disable();
    }
    this.ngx.resetModalData('loadBalancerRouteModal');
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100), NameValidator])],
      destination: ['', Validators.compose([Validators.required, IpAddressCidrValidator])],
      gateway: ['', Validators.compose([Validators.required, IpAddressIpValidator])],
    });
  }

  public reset() {
    this.submitted = false;
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }
}
