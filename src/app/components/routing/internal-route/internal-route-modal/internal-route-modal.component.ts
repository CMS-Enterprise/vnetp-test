import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import {
  ExternalVrfConnection,
  Subnet,
  AppCentricSubnet,
  V1NetworkSubnetsService,
  V2AppCentricAppCentricSubnetsService,
  InternalRoute,
  V2RoutingInternalRoutesService,
  V3GlobalEnvironmentsService,
} from '../../../../../../client';
import { InternalRouteModalDto } from '../../../../models/network-scope-forms/internal-route-modal.dto';
import { ApplicationMode } from '../../../../models/other/application-mode-enum';
import { ModalMode } from '../../../../models/other/modal-mode';
import { DatacenterContextService } from '../../../../services/datacenter-context.service';
import { RouteDataUtil } from '../../../../utils/route-data.util';

// Interface for VRF option display
interface VrfOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-internal-route-modal',
  templateUrl: './internal-route-modal.component.html',
  styleUrl: './internal-route-modal.component.css',
})
export class InternalRouteModalComponent implements OnInit, OnDestroy {
  public modalMode: ModalMode;
  public form: FormGroup;
  public internalRouteId: string;
  public submitted: boolean;
  public externalVrfConnection: ExternalVrfConnection;
  private datacenterId: string;
  private datacenterSubscription: Subscription;
  public availableNetcentricSubnets: Subnet[];
  public availableAppcentricSubnets: AppCentricSubnet[];
  public applicationMode: ApplicationMode;
  public vrfOptions: VrfOption[] = [];
  public ApplicationMode = ApplicationMode;
  public tenantId: string;
  @Output() routeChanges = new EventEmitter<void>();

  constructor(
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
    private internalRouteService: V2RoutingInternalRoutesService,
    private datacenterContextService: DatacenterContextService,
    private netcentricSubnetService: V1NetworkSubnetsService,
    private appcentricSubnetService: V2AppCentricAppCentricSubnetsService,
    private route: ActivatedRoute,
    private environmentService: V3GlobalEnvironmentsService,
  ) {}

  ngOnInit(): void {
    this.applicationMode = RouteDataUtil.getApplicationModeFromRoute(this.route);

    if (!this.applicationMode) {
      console.error('InternalRouteModalComponent: Application mode could not be determined via RouteDataUtil.');
      // Fallback or error handling if necessary
    }

    this.buildVrfOptions();
    this.buildForm();
  }

  ngOnDestroy(): void {
    this.datacenterSubscription?.unsubscribe();
  }

  public getSubnetsByApplicationMode(): void {
    if (this.applicationMode === 'netcentric') {
      this.datacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
        if (cd) {
          this.datacenterId = cd.id;
          this.getNetcentricSubnets();
        }
      });
    } else {
      this.getAppcentricSubnets();
    }
  }

  /**
   * Build VRF options from the VrfExternalVrfsEnum
   */
  private buildVrfOptions(): void {
    if (!this.externalVrfConnection) {
      return;
    }

    // const firewallExternalVrfs = this.externalVrfConnection.externalFirewall.externalVrfConnections.map(
    //   connection => connection.externalVrf,
    // );

    this.environmentService
      .getOneEnvironment({ id: this.externalVrfConnection.tenant.environmentId, relations: ['externalVrfs'] })
      .subscribe(environment => {
        this.vrfOptions = environment.externalVrfs.map(vrf => ({
          value: vrf.name,
          label: vrf.name,
        }));
      });
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.reset();
    this.ngx.close('internalRouteModal');
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('internalRouteModal') as InternalRouteModalDto);
    this.externalVrfConnection = dto.externalVrfConnection;
    this.modalMode = dto.modalMode;
    this.tenantId = dto.tenantId;
    this.getSubnetsByApplicationMode();

    if (this.modalMode === ModalMode.Edit) {
      this.internalRouteId = dto.internalRoute.id;
    } else {
      this.form.controls.netcentricSubnetId.enable();
      this.form.controls.appcentricSubnetId.enable();
    }

    const internalRoute = dto.internalRoute;
    if (internalRoute !== undefined) {
      // this.form.controls.netcentricSubnetId.setValue(internalRoute?.netcentricSubnetId);
      this.form.controls.appcentricSubnetId.setValue(internalRoute?.appcentricSubnetId);
      this.form.controls.netcentricSubnetId.disable();
      this.form.controls.appcentricSubnetId.disable();
      this.form.controls.exportedToVrfs.disable();
    }
    this.ngx.resetModalData('internalRouteModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('internalRouteModal');
    this.buildForm();
  }

  public buildForm(): void {
    this.form = this.formBuilder.group({
      netcentricSubnetId: [''],
      appcentricSubnetId: [''],
    });
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { netcentricSubnetId, appcentricSubnetId } = this.form.value;
    const internalRoute = {
      externalVrfConnectionId: this.externalVrfConnection.id,
      datacenterId: this.datacenterId,
      netcentricSubnetId: netcentricSubnetId || null,
      appcentricSubnetId: appcentricSubnetId || null,
      tenantId: this.tenantId,
    } as InternalRoute;

    if (this.modalMode === ModalMode.Create) {
      this.internalRouteService.createOneInternalRoute({ internalRoute }).subscribe(() => {
        this.closeModal();
      });
    } else {
      delete internalRoute.externalVrfConnectionId;
      delete internalRoute.appcentricSubnetId;
      delete internalRoute.tenantId;

      this.internalRouteService
        .updateOneInternalRoute({
          id: this.internalRouteId,
          internalRoute,
        })
        .subscribe(() => {
          this.closeModal();
        });
    }
  }

  getNetcentricSubnets(): void {
    this.netcentricSubnetService.getSubnetsByDatacenterIdSubnet({ datacenterId: this.datacenterId }).subscribe(data => {
      this.availableNetcentricSubnets = data as unknown as Subnet[];
    });
  }

  getAppcentricSubnets(): void {
    this.appcentricSubnetService
      .getManyAppCentricSubnet({
        filter: [`tenantId||eq||${this.tenantId}`],
        relations: ['tenant', 'bridgeDomain'],
      })
      .subscribe(data => {
        this.availableAppcentricSubnets = data as unknown as AppCentricSubnet[];
      });
  }
}
