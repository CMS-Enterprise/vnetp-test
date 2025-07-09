import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Tenant, V2AppCentricTenantsService, VrfTransitTenantVrfsEnum } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { TenantModalDto } from 'src/app/models/appcentric/tenant-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { ApplicationMode } from 'src/app/models/other/application-mode-enum';
import { NameValidator } from 'src/app/validators/name-validator';
import { TenantSelectModalHelpText } from 'src/app/helptext/help-text-networking';
import { RouteDataUtil } from 'src/app/utils/route-data.util';

// VRF Configuration interface
interface VrfConfiguration {
  name: string;
  description: string;
  externalConnectivity: string[];
  northSouthFirewallVendor: string;
  northSouthFirewallArchitecture: string;
  northSouthHa: boolean;
  northSouthHaMode: string;
  eastWestFirewallVendor: string;
  eastWestFirewallArchitecture: string;
  eastWestHa: boolean;
  eastWestHaMode: string;
  northSouthAppId: boolean;
  eastWestAppId: boolean;
  nat64NorthSouth: boolean;
  eastWestNat: boolean;
  eastWestAllowSgBypass: boolean;
}

@Component({
  selector: 'app-tenant-select-modal',
  templateUrl: './tenant-select-modal.component.html',
  styleUrls: ['./tenant-select-modal.component.css'],
})
export class TenantSelectModalComponent implements OnInit {
  public ModalMode: ModalMode;
  public TenantId: string;
  public form: UntypedFormGroup;
  public submitted: boolean;
  public isAdminPortalMode = false;
  public isTenantV2Mode = false;
  public currentMode: ApplicationMode;
  public modalData: TenantModalDto;
  public selectedFile: File = null;
  public firewallVendorOptions = ['ASA', 'PANOS'];
  public firewallArchitectureOptions = ['Physical', 'Virtual'];
  public haModesOptions = ['Active-Passive', 'Active-Active'];
  public datacenterOptions = ['East', 'West'];
  public deploymentModeOptions = ['Hot Site First', 'Cold Site First', 'Scheduled Sync'];
  public externalConnectivityOptions: string[] = [];
  public vrfConfigurations: VrfConfiguration[] = [];

  // Help text for tooltips
  public helpText: TenantSelectModalHelpText;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private ngx: NgxSmartModalService,
    private tenantService: V2AppCentricTenantsService,
    helpText: TenantSelectModalHelpText,
  ) {
    this.helpText = helpText;
  }

  ngOnInit(): void {
    this.determineApplicationMode();
    this.initializeExternalConnectivityOptions();
    this.buildForm();
    this.initializeVrfConfigurations();
  }

  /**
   * Initialize external connectivity options from VrfTransitTenantVrfsEnum
   */
  private initializeExternalConnectivityOptions(): void {
    this.externalConnectivityOptions = Object.values(VrfTransitTenantVrfsEnum);
  }

  /**
   * Initialize VRF configurations with a default VRF
   */
  private initializeVrfConfigurations(): void {
    this.vrfConfigurations = [this.createDefaultVrfConfiguration()];
  }

  /**
   * Create a default VRF configuration
   */
  private createDefaultVrfConfiguration(): VrfConfiguration {
    return {
      name: 'default_vrf',
      description: 'Default VRF configuration',
      externalConnectivity: [VrfTransitTenantVrfsEnum.CmsnetAppprod],
      northSouthFirewallVendor: 'PANOS',
      northSouthFirewallArchitecture: 'Virtual',
      northSouthHa: true,
      northSouthHaMode: 'Active-Passive',
      eastWestFirewallVendor: 'PANOS',
      eastWestFirewallArchitecture: 'Virtual',
      eastWestHa: true,
      eastWestHaMode: 'Active-Passive',
      northSouthAppId: true,
      eastWestAppId: true,
      nat64NorthSouth: true,
      eastWestNat: false,
      eastWestAllowSgBypass: false,
    };
  }

  /**
   * Add a new VRF configuration
   */
  public addVrf(): void {
    const newVrf = this.createDefaultVrfConfiguration();
    newVrf.name = ''; // Clear the name for new VRFs
    newVrf.description = '';
    this.vrfConfigurations.push(newVrf);
  }

  /**
   * Remove a VRF configuration
   */
  public removeVrf(index: number): void {
    const vrf = this.vrfConfigurations[index];

    // Prevent deletion if it's the last VRF or if it's the default_vrf
    if (this.vrfConfigurations.length > 1 && vrf.name !== 'default_vrf') {
      this.vrfConfigurations.splice(index, 1);
    }
  }

  /**
   * Check if a VRF can be removed
   */
  public canRemoveVrf(index: number): boolean {
    const vrf = this.vrfConfigurations[index];
    return this.vrfConfigurations.length > 1 && vrf.name !== 'default_vrf';
  }

  /**
   * Check if an external connectivity option is selected for a VRF
   */
  public isExternalConnectivitySelected(vrfIndex: number, option: string): boolean {
    return this.vrfConfigurations[vrfIndex].externalConnectivity.includes(option);
  }

  /**
   * Toggle an external connectivity option for a VRF
   */
  public toggleExternalConnectivity(vrfIndex: number, option: string): void {
    const vrf = this.vrfConfigurations[vrfIndex];
    const index = vrf.externalConnectivity.indexOf(option);

    if (index > -1) {
      vrf.externalConnectivity.splice(index, 1);
    } else {
      vrf.externalConnectivity.push(option);
    }
  }

  /**
   * Updates availability of HA options based on tenant size
   */
  private updateSizeBasedOptions(): void {
    const tenantSize = this.form.get('tenantSize').value;

    // For x-small or small tenants, update VRF configurations to restrict east/west firewall architecture to Virtual and disable HA
    if (tenantSize === 'x-small' || tenantSize === 'small') {
      this.vrfConfigurations.forEach(vrf => {
        vrf.eastWestFirewallArchitecture = 'Virtual';
        vrf.eastWestHa = false;
      });
    }
  }

  /**
   * Updates regional HA options visibility and validation
   */
  private updateRegionalHaOptions(): void {
    const regionalHaEnabled = this.form.get('regionalHa').value;

    if (regionalHaEnabled) {
      this.form.get('primaryDatacenter').enable();
      this.form.get('secondaryDatacenter').enable();

      // Update deployment mode visibility based on whether a secondary site is selected
      this.updateDeploymentModeVisibility();
    } else {
      this.form.get('primaryDatacenter').disable();
      this.form.get('secondaryDatacenter').disable();
      this.form.get('deploymentMode').disable();
    }
  }

  /**
   * Updates deployment mode visibility based on secondary datacenter selection
   */
  private updateDeploymentModeVisibility(): void {
    const secondaryDatacenter = this.form.get('secondaryDatacenter').value;

    if (secondaryDatacenter && secondaryDatacenter !== '') {
      this.form.get('deploymentMode').enable();
    } else {
      this.form.get('deploymentMode').disable();
    }
  }

  /**
   * Ensures primary and secondary datacenters are not the same
   */
  private validateDatacenterSelection(): void {
    const primaryDatacenter = this.form.get('primaryDatacenter').value;
    const secondaryDatacenter = this.form.get('secondaryDatacenter').value;

    if (secondaryDatacenter && primaryDatacenter === secondaryDatacenter) {
      this.form.get('secondaryDatacenter').setValue('');
    }
  }

  private determineApplicationMode(): void {
    this.currentMode = RouteDataUtil.getApplicationModeFromRoute(this.route);
    this.isAdminPortalMode = this.currentMode === ApplicationMode.ADMINPORTAL;
    this.isTenantV2Mode = this.currentMode === ApplicationMode.TENANTV2;
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('tenantModal');
    this.reset();
  }

  public getData(): void {
    this.modalData = Object.assign({}, this.ngx.getModalData('tenantModal') as TenantModalDto);
    this.ModalMode = this.modalData.ModalMode;

    if (this.ModalMode === ModalMode.Edit) {
      this.TenantId = this.modalData.Tenant.id;
    } else {
      this.form.controls.name.enable();
    }

    const tenant = this.modalData.Tenant;
    if (tenant !== undefined) {
      this.form.controls.name.setValue(tenant.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(tenant.description);
      this.form.controls.alias.setValue(tenant.alias);
    }

    // Set AdminPortal specific form values if in admin portal mode
    if (this.isAdminPortalMode) {
      this.form.controls.tenantSize.setValue(this.modalData.tenantSize || 'medium');
      this.form.controls.vcdLocation.setValue(this.modalData.vcdLocation || 'VCD-East');
      this.form.controls.vcdTenantType.setValue(this.modalData.vcdTenantType || 'new');

      this.form.controls.regionalHa.setValue(this.modalData.regionalHa || false);
      this.form.controls.primaryDatacenter.setValue(this.modalData.primaryDatacenter || 'East');
      this.form.controls.secondaryDatacenter.setValue(this.modalData.secondaryDatacenter || '');
      this.form.controls.deploymentMode.setValue(this.modalData.deploymentMode || 'Hot Site First');

      if (this.modalData.vcdTenantId) {
        this.form.controls.vcdTenantId.setValue(this.modalData.vcdTenantId);
      }

      // Update size-based options
      this.updateSizeBasedOptions();

      // Update regional HA options
      this.updateRegionalHaOptions();
    }

    this.ngx.resetModalData('tenantModal');
  }

  public reset(): void {
    this.submitted = false;
    this.selectedFile = null;
    this.ngx.resetModalData('tenantModal');
    this.buildForm();
    this.initializeVrfConfigurations();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      alias: ['', Validators.compose([Validators.maxLength(100)])],
      description: ['', Validators.compose([Validators.maxLength(500)])],

      // Base tenant options
      tenantSize: ['medium'],
      vendorAgnosticNat: [false],
      multiVrf: [false],
      multiL3out: [false],

      // Regional HA options
      regionalHa: [false],
      primaryDatacenter: ['East'],
      secondaryDatacenter: [''],
      deploymentMode: ['Hot Site First'],

      // VMWare Cloud Director Integration
      vcdLocation: ['VCD-East'],
      vcdTenantType: ['new'],
      vcdTenantId: [''],
    });

    // Set up form control value change handlers
    this.form.get('vcdTenantType').valueChanges.subscribe(value => {
      if (value === 'existing') {
        this.form.get('vcdTenantId').setValidators([Validators.required]);
      } else {
        this.form.get('vcdTenantId').clearValidators();
        this.form.get('vcdTenantId').setValue('');
      }
      this.form.get('vcdTenantId').updateValueAndValidity();
    });

    // New form control handlers
    this.form.get('tenantSize').valueChanges.subscribe(() => {
      this.updateSizeBasedOptions();
    });

    this.form.get('regionalHa').valueChanges.subscribe(() => {
      this.updateRegionalHaOptions();
    });

    this.form.get('primaryDatacenter').valueChanges.subscribe(() => {
      this.validateDatacenterSelection();
    });

    this.form.get('secondaryDatacenter').valueChanges.subscribe(() => {
      this.validateDatacenterSelection();
      this.updateDeploymentModeVisibility();
    });

    // Initialize the form state
    this.updateSizeBasedOptions();
    this.updateRegionalHaOptions();
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
    }
  }

  private createTenant(tenant: Tenant): void {
    if (this.isAdminPortalMode) {
      this.tenantService.createOneV2TenantTenant({ tenant: { name: tenant.name } as any }).subscribe(() => {
        this.closeModal();
      });
    } else {
      this.tenantService.createOneTenant({ tenant }).subscribe(() => {
        this.closeModal();
      });
    }
  }

  private editTenant(tenant: Tenant): void {
    delete tenant.name;
    this.tenantService
      .updateOneTenant({
        id: this.TenantId,
        tenant,
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

    const {
      name,
      description,
      alias,
      tenantSize,
      vendorAgnosticNat,
      multiVrf,
      multiL3out,
      regionalHa,
      primaryDatacenter,
      secondaryDatacenter,
      deploymentMode,
      vcdLocation,
      vcdTenantType,
      vcdTenantId,
    } = this.form.value;

    const tenant = {
      name,
      description,
      alias,
    } as Tenant;

    if (this.isAdminPortalMode) {
      // Add AdminPortal specific properties
      // Note: These would normally be added to a tenant configuration object or metadata
      // But for now we'll just log them
      console.log('AdminPortal Tenant Configuration:', {
        tenantSize,
        vendorAgnosticNat,
        multiVrf,
        multiL3out,
        regionalHa,
        primaryDatacenter: regionalHa ? primaryDatacenter : null,
        secondaryDatacenter: regionalHa && secondaryDatacenter ? secondaryDatacenter : null,
        deploymentMode: regionalHa && secondaryDatacenter ? deploymentMode : null,
        vcdLocation,
        vcdTenantType,
        vcdTenantId: vcdTenantType === 'existing' ? vcdTenantId : null,
        vrfConfigurations: multiVrf ? this.vrfConfigurations : null,
        templateFile: this.selectedFile ? this.selectedFile.name : null,
      });
    }

    if (this.ModalMode === ModalMode.Create) {
      this.createTenant(tenant);
    } else {
      this.editTenant(tenant);
    }
  }
}
