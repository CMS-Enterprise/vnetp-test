import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import {
  AppCentricSubnet,
  Subnet,
  V1NetworkScopeFormsWanFormSubnetService,
  V1NetworkSubnetsService,
  V2AppCentricAppCentricSubnetsService,
  WanFormSubnet,
  VrfTransitTenantVrfsEnum,
} from '../../../../../../../client';
import { WanFormSubnetModalDto } from '../../../../../models/network-scope-forms/wan-form-subnet-modal.dto';
import { ModalMode } from '../../../../../models/other/modal-mode';
import { DatacenterContextService } from '../../../../../services/datacenter-context.service';
import { NameValidator } from '../../../../../validators/name-validator';
import { ActivatedRoute } from '@angular/router';
import { ApplicationMode } from 'src/app/models/other/application-mode-enum';
import { RouteDataUtil } from 'src/app/utils/route-data.util';

// Interface for VRF option display
interface VrfOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-wan-form-subnets-modal',
  templateUrl: './wan-form-subnets-modal.component.html',
  styleUrl: './wan-form-subnets-modal.component.css',
})
export class WanFormSubnetsModalComponent implements OnInit, OnDestroy {
  public modalMode: ModalMode;
  public form: FormGroup;
  public wanFormSubnetId: string;
  public submitted: boolean;
  public wanFormId: string;
  private datacenterId: string;
  private datacenterSubscription: Subscription;
  public availableNetcentricSubnets: Subnet[];
  public availableAppcentricSubnets: AppCentricSubnet[];
  public currentDcsMode: ApplicationMode;
  public tenantId: string;
  public vrfOptions: VrfOption[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
    private wanFormSubnetService: V1NetworkScopeFormsWanFormSubnetService,
    private datacenterContextService: DatacenterContextService,
    private netcentricSubnetService: V1NetworkSubnetsService,
    private appcentricSubnetService: V2AppCentricAppCentricSubnetsService,
    private route: ActivatedRoute,
  ) {
    this.tenantId = this.route.snapshot.queryParams.tenantId;
  }

  ngOnInit(): void {
    this.currentDcsMode = RouteDataUtil.getApplicationModeFromRoute(this.route);

    if (!this.currentDcsMode) {
      console.error('WanFormSubnetsModalComponent: Application mode could not be determined via RouteDataUtil.');
      // Fallback or error handling if necessary
    }

    this.buildVrfOptions();
    this.buildForm();
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

  ngOnDestroy(): void {
    this.datacenterSubscription?.unsubscribe();
  }

  /**
   * Build VRF options from the VrfTransitTenantVrfsEnum
   */
  private buildVrfOptions(): void {
    this.vrfOptions = Object.values(VrfTransitTenantVrfsEnum).map(enumValue => ({
      value: enumValue,
      label: this.getVrfDisplayLabel(enumValue),
    }));
  }

  /**
   * Convert enum values to user-friendly display labels
   */
  private getVrfDisplayLabel(enumValue: VrfTransitTenantVrfsEnum): string {
    const labelMappings: Record<VrfTransitTenantVrfsEnum, string> = {
      [VrfTransitTenantVrfsEnum.CmsEntsrvInet]: 'cms-entsrv-inet',
      [VrfTransitTenantVrfsEnum.CmsEntsrvLdapdns]: 'cms-entsrv-ldapdns',
      [VrfTransitTenantVrfsEnum.CmsEntsrvMgmt]: 'cms-entsrv-mgmt',
      [VrfTransitTenantVrfsEnum.CmsEntsrvMon]: 'cms-entsrv-mon',
      [VrfTransitTenantVrfsEnum.CmsEntsrvPres]: 'cms-entsrv-pres',
      [VrfTransitTenantVrfsEnum.CmsEntsrvSec]: 'cms-entsrv-sec',
      [VrfTransitTenantVrfsEnum.CmsEntsrvVpn]: 'cms-entsrv-vpn',
      [VrfTransitTenantVrfsEnum.CmsnetAppdev]: 'cmsnet_appdev (Development)',
      [VrfTransitTenantVrfsEnum.CmsnetAppprod]: 'cmsnet_appprod (Production)',
      [VrfTransitTenantVrfsEnum.CmsnetDatadev]: 'cmsnet_datadev (Data Development)',
      [VrfTransitTenantVrfsEnum.CmsnetDataprod]: 'cmsnet_dataprod (Data Production)',
      [VrfTransitTenantVrfsEnum.CmsnetEdcVpn]: 'cmsnet_edc_vpn',
      [VrfTransitTenantVrfsEnum.CmsnetEdcmgmt]: 'cmsnet_edcmgmt',
      [VrfTransitTenantVrfsEnum.CmsnetPresdev]: 'cmsnet_presdev (Presentation Development)',
      [VrfTransitTenantVrfsEnum.CmsnetPresprod]: 'cmsnet_presprod (Presentation Production)',
      [VrfTransitTenantVrfsEnum.CmsnetSec]: 'cmsnet_sec',
      [VrfTransitTenantVrfsEnum.CmsnetTransport]: 'cmsnet_transport',
    };

    return labelMappings[enumValue] || enumValue;
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.reset();
    this.ngx.close('wanFormSubnetModal');
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('wanFormSubnetModal') as WanFormSubnetModalDto);
    this.wanFormId = dto.wanFormId;
    this.modalMode = dto.modalMode;

    if (this.modalMode === ModalMode.Edit) {
      this.wanFormSubnetId = dto.wanFormSubnet.id;
    } else {
      this.form.controls.name.enable();
      this.form.controls.netcentricSubnetId.enable();
      this.form.controls.appcentricSubnetId.enable();
      this.form.controls.vrf.enable();
      this.form.controls.environment.enable();
    }

    const wanFormSubnet = dto.wanFormSubnet;
    if (wanFormSubnet !== undefined) {
      this.form.controls.name.setValue(wanFormSubnet.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(wanFormSubnet.description);
      this.form.controls.vrf.setValue(wanFormSubnet.exportedToVrfs);
      this.form.controls.netcentricSubnetId.setValue(wanFormSubnet?.netcentricSubnetId);
      this.form.controls.appcentricSubnetId.setValue(wanFormSubnet?.appcentricSubnetId);
      this.form.controls.netcentricSubnetId.disable();
      this.form.controls.appcentricSubnetId.disable();
      this.form.controls.vrf.disable();
    }
    this.ngx.resetModalData('wanFormSubnetModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('wanFormSubnetModal');
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

    const { name, description, vrf, environment, netcentricSubnetId, appcentricSubnetId, fromPrefixLength, toPrefixLength } =
      this.form.value;
    const wanFormSubnet = {
      name,
      description,
      exportedToVrfs: vrf,
      environment,
      wanFormId: this.wanFormId,
      datacenterId: this.datacenterId,
      netcentricSubnetId,
      appcentricSubnetId,
      fromPrefixLength,
      toPrefixLength,
    } as WanFormSubnet;

    if (this.modalMode === ModalMode.Create) {
      if (this.currentDcsMode === 'netcentric') {
        delete wanFormSubnet.appcentricSubnetId;
      }
      if (this.currentDcsMode === 'appcentric') {
        delete wanFormSubnet.netcentricSubnetId;
      }
      this.wanFormSubnetService.createOneWanFormSubnet({ wanFormSubnet }).subscribe(() => {
        this.closeModal();
      });
    } else {
      delete wanFormSubnet.wanFormId;
      delete wanFormSubnet.netcentricSubnetId;
      delete wanFormSubnet.appcentricSubnetId;

      this.wanFormSubnetService
        .updateOneWanFormSubnet({
          id: this.wanFormSubnetId,
          wanFormSubnet,
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
