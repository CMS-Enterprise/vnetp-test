import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { LoadBalancerRoute, V1LoadBalancerRoutesService } from 'client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';
import { RouteModalDto } from './route-modal.dto';
import { IpAddressCidrValidator, IpAddressIpValidator } from 'src/app/validators/network-form-validators';

@Component({
  selector: 'app-route-modal',
  templateUrl: './route-modal.component.html',
})
export class RouteModalComponent implements OnInit {
  public form: UntypedFormGroup;
  public submitted: boolean;

  private routeId: string;
  private modalMode: ModalMode;
  private tierId: string;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: UntypedFormBuilder,
    private routeService: V1LoadBalancerRoutesService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('routeModal');
    this.submitted = false;
    this.buildForm();
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { destination, gateway, name } = this.form.value;

    const route: LoadBalancerRoute = {
      tierId: this.tierId,
      destination,
      gateway,
      name,
    };

    if (this.modalMode === ModalMode.Create) {
      this.createRoute(route);
    } else {
      this.updateRoute(route);
    }
  }

  public getData(): void {
    const dto: RouteModalDto = Object.assign({}, this.ngx.getModalData('routeModal')) as any;
    const { route, tierId } = dto;
    this.tierId = tierId;
    this.modalMode = route ? ModalMode.Edit : ModalMode.Create;

    if (this.modalMode === ModalMode.Edit) {
      const { destination, gateway, name, id } = route;
      this.routeId = id;
      this.form.controls.name.disable();
      this.form.controls.destination.disable();
      this.form.controls.gateway.disable();
      this.form.controls.destination.setValue(destination);
      this.form.controls.gateway.setValue(gateway);
      this.form.controls.name.setValue(name);
    } else {
      this.form.controls.destination.enable();
      this.form.controls.gateway.enable();
      this.form.controls.name.enable();
    }
    this.ngx.resetModalData('routeModal');
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      destination: ['', Validators.compose([Validators.required, IpAddressCidrValidator])],
      gateway: ['', Validators.compose([Validators.required, IpAddressIpValidator])],
      name: ['', NameValidator()],
    });
  }

  private createRoute(loadBalancerRoute: LoadBalancerRoute): void {
    this.routeService.createOneLoadBalancerRoute({ loadBalancerRoute }).subscribe(
      () => this.closeModal(),
      () => {},
    );
  }

  private updateRoute(loadBalancerRoute: LoadBalancerRoute): void {
    loadBalancerRoute.tierId = null;
    this.routeService
      .updateOneLoadBalancerRoute({
        id: this.routeId,
        loadBalancerRoute,
      })
      .subscribe(
        () => this.closeModal(),
        () => {},
      );
  }
}
