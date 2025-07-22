import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import {
  WanForm,
  Subnet,
  AppCentricSubnet,
  V1NetworkSubnetsService,
  V2AppCentricAppCentricSubnetsService,
  InternalRoute,
  V1NetworkScopeFormsWanFormInternalRoutesService,
  VrfExternalVrfsEnum,
} from '../../../../../../client';
import { InternalRouteModalDto } from '../../../../models/network-scope-forms/internal-route-modal.dto';
import { ApplicationMode } from '../../../../models/other/application-mode-enum';
import { ModalMode } from '../../../../models/other/modal-mode';
import { DatacenterContextService } from '../../../../services/datacenter-context.service';
import { RouteDataUtil } from '../../../../utils/route-data.util';
import { NameValidator } from '../../../../validators/name-validator';

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
  public wanForm: WanForm;
  private datacenterId: string;
  private datacenterSubscription: Subscription;
  public availableNetcentricSubnets: Subnet[];
  public availableAppcentricSubnets: AppCentricSubnet[];
  public currentDcsMode: ApplicationMode;
  public vrfOptions: VrfOption[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
    private internalRouteService: V1NetworkScopeFormsWanFormInternalRoutesService,
    private datacenterContextService: DatacenterContextService,
    private netcentricSubnetService: V1NetworkSubnetsService,
    private appcentricSubnetService: V2AppCentricAppCentricSubnetsService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.currentDcsMode = RouteDataUtil.getApplicationModeFromRoute(this.route);

    if (!this.currentDcsMode) {
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
    if (this.currentDcsMode === 'netcentric') {
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
    this.vrfOptions = Object.values(VrfExternalVrfsEnum).map(enumValue => ({
      value: enumValue,
      label: this.getVrfDisplayLabel(enumValue),
    }));
  }

  /**
   * Convert enum values to user-friendly display labels
   */
  private getVrfDisplayLabel(enumValue: VrfExternalVrfsEnum): string {
    // const labelMappings: Record<VrfExternalVrfsEnum, string> = {
    //   [VrfExternalVrfsEnum.CmsEntsrvInet]: 'cms-entsrv-inet',
    //   [VrfExternalVrfsEnum.CmsEntsrvLdapdns]: 'cms-entsrv-ldapdns',
    //   [VrfExternalVrfsEnum.CmsEntsrvMgmt]: 'cms-entsrv-mgmt',
    //   [VrfExternalVrfsEnum.CmsEntsrvMon]: 'cms-entsrv-mon',
    //   [VrfExternalVrfsEnum.CmsEntsrvPres]: 'cms-entsrv-pres',
    //   [VrfExternalVrfsEnum.CmsEntsrvSec]: 'cms-entsrv-sec',
    //   [VrfExternalVrfsEnum.CmsEntsrvVpn]: 'cms-entsrv-vpn',
    //   [VrfExternalVrfsEnum.CmsnetAppdev]: 'cmsnet_appdev (Development)',
    //   [VrfExternalVrfsEnum.CmsnetAppprod]: 'cmsnet_appprod (Production)',
    //   [VrfExternalVrfsEnum.CmsnetDatadev]: 'cmsnet_datadev (Data Development)',
    //   [VrfExternalVrfsEnum.CmsnetDataprod]: 'cmsnet_dataprod (Data Production)',
    //   [VrfExternalVrfsEnum.CmsnetEdcVpn]: 'cmsnet_edc_vpn',
    //   [VrfExternalVrfsEnum.CmsnetEdcmgmt]: 'cmsnet_edcmgmt',
    //   [VrfExternalVrfsEnum.CmsnetPresdev]: 'cmsnet_presdev (Presentation Development)',
    //   [VrfExternalVrfsEnum.CmsnetPresprod]: 'cmsnet_presprod (Presentation Production)',
    //   [VrfExternalVrfsEnum.CmsnetSec]: 'cmsnet_sec',
    //   [VrfExternalVrfsEnum.CmsnetTransport]: 'cmsnet_transport',
    // };

    // return labelMappings[enumValue] || enumValue;

    return enumValue;
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
    this.wanForm = dto.wanForm;
    this.modalMode = dto.modalMode;
    this.getSubnetsByApplicationMode();

    if (this.modalMode === ModalMode.Edit) {
      this.internalRouteId = dto.internalRoute.id;
    } else {
      this.form.controls.name.enable();
      this.form.controls.netcentricSubnetId.enable();
      this.form.controls.appcentricSubnetId.enable();
      this.form.controls.vrf.enable();
    }

    const internalRoute = dto.internalRoute;
    if (internalRoute !== undefined) {
      this.form.controls.name.setValue(internalRoute.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(internalRoute.description);
      this.form.controls.vrf.setValue(internalRoute.exportedToVrfs);
      this.form.controls.netcentricSubnetId.setValue(internalRoute?.netcentricSubnetId);
      this.form.controls.appcentricSubnetId.setValue(internalRoute?.appcentricSubnetId);
      this.form.controls.netcentricSubnetId.disable();
      this.form.controls.appcentricSubnetId.disable();
      this.form.controls.vrf.disable();
    }
    this.ngx.resetModalData('internalRouteModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('internalRouteModal');
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      description: ['', Validators.compose([Validators.maxLength(500)])],
      vrf: ['', Validators.required],
      netcentricSubnetId: [''],
      appcentricSubnetId: [''],
      fromPrefixLength: ['', Validators.required],
      toPrefixLength: ['', Validators.required],
    });
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { name, description, vrf, netcentricSubnetId, appcentricSubnetId, fromPrefixLength, toPrefixLength } =
      this.form.value;
    const internalRoute = {
      name,
      description,
      exportedToVrfs: vrf,
      wanFormId: this.wanForm.id,
      datacenterId: this.datacenterId,
      netcentricSubnetId,
      appcentricSubnetId,
      fromPrefixLength,
      toPrefixLength,
    } as InternalRoute;

    if (this.modalMode === ModalMode.Create) {
      if (this.currentDcsMode === 'netcentric') {
        delete internalRoute.appcentricSubnetId;
      }
      if (this.currentDcsMode === 'appcentric') {
        delete internalRoute.netcentricSubnetId;
      }
      this.internalRouteService.createOneInternalRoute({ internalRoute }).subscribe(() => {
        this.closeModal();
      });
    } else {
      delete internalRoute.wanFormId;
      delete internalRoute.netcentricSubnetId;
      delete internalRoute.appcentricSubnetId;

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
        filter: [`tenantId||eq||${this.wanForm.tenantId}`],
        relations: ['tenant', 'bridgeDomain'],
      })
      .subscribe(data => {
        this.availableAppcentricSubnets = data as unknown as AppCentricSubnet[];
      });
  }
}
