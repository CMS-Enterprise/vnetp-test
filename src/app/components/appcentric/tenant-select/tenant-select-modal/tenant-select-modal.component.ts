import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  VrfExternalVrfsEnum,
  AdminV2AppCentricTenantsService,
  TenantAdminCreateDto,
  TenantAdminDto,
  VrfAdminDto,
  VrfAdminDtoExternalVrfsEnum,
  VrfAdminDtoDefaultExternalVrfEnum
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { TenantModalDto } from 'src/app/models/appcentric/tenant-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { ApplicationMode } from 'src/app/models/other/application-mode-enum';
import { NameValidator } from 'src/app/validators/name-validator';
import { TenantSelectModalHelpText } from 'src/app/helptext/help-text-networking';
import { RouteDataUtil } from 'src/app/utils/route-data.util';

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
  public selectedExternalVrf = '';
  public externalConnectivityOptions: string[] = [];
  public vrfConfigurations: VrfAdminDto[] = [];
  public vrfCollapsedStates: boolean[] = [];

  // Help text for tooltips
  public helpText: TenantSelectModalHelpText;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private ngx: NgxSmartModalService,
    private tenantService: AdminV2AppCentricTenantsService,
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
   * Initialize external connectivity options from VrfExternalVrfsEnum
   */
  private initializeExternalConnectivityOptions(): void {
    this.externalConnectivityOptions = Object.values(VrfExternalVrfsEnum);
  }

  /**
   * Initialize VRF configurations with a default VRF
   */
  private initializeVrfConfigurations(): void {
    this.vrfConfigurations = [this.createDefaultVrfConfiguration()];
    this.vrfCollapsedStates = [false]; // Default VRF starts expanded
  }

  /**
   * Create a default VRF configuration
   */
  private createDefaultVrfConfiguration(): VrfAdminDto {
    return {
      name: 'default_vrf',
      alias: '',
      description: 'Default VRF configuration',
      externalVrfs: [VrfAdminDtoExternalVrfsEnum.CmsnetTransport],
      defaultExternalVrf: VrfAdminDtoDefaultExternalVrfEnum.CmsnetTransport,
      policyControlEnforced: true,
      policyControlEnforcementIngress: true,
      hostBasedRoutesToExternalVrfs: false,
      maxExternalRoutes: 100,
      bgpASN: 65000
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
    this.vrfCollapsedStates.push(false); // New VRFs start expanded
  }

  /**
   * Remove a VRF configuration
   */
  public removeVrf(index: number): void {
    const vrf = this.vrfConfigurations[index];

    // Prevent deletion if it's the last VRF or if it's the default_vrf
    if (this.vrfConfigurations.length > 1 && vrf.name !== 'default_vrf') {
      this.vrfConfigurations.splice(index, 1);
      this.vrfCollapsedStates.splice(index, 1);
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
   * Get available external VRFs for a specific VRF configuration (not already selected)
   */
  public getAvailableExternalVrfs(vrfIndex: number): VrfAdminDtoExternalVrfsEnum[] {
    const selectedVrfs = this.vrfConfigurations[vrfIndex].externalVrfs || [];
    return Object.values(VrfAdminDtoExternalVrfsEnum).filter(
      vrf => !selectedVrfs.includes(vrf)
    );
  }

  /**
   * Add an external VRF to a VRF configuration
   */
  public addExternalVrf(vrfIndex: number, selectedVrf: VrfAdminDtoExternalVrfsEnum): void {
    const vrf = this.vrfConfigurations[vrfIndex];
    if (!vrf.externalVrfs) {
      vrf.externalVrfs = [];
    }

    if (!vrf.externalVrfs.includes(selectedVrf)) {
      vrf.externalVrfs.push(selectedVrf);

      // If this is the first external VRF, make it the default
      if (vrf.externalVrfs.length === 1) {
        vrf.defaultExternalVrf = selectedVrf as unknown as VrfAdminDtoDefaultExternalVrfEnum;
      }
    }
  }

  /**
   * Add an external VRF and clear the selection
   */
  public addExternalVrfAndClear(vrfIndex: number, selectedVrf: string): void {
    if (selectedVrf) {
      this.addExternalVrf(vrfIndex, selectedVrf as any);
      this.selectedExternalVrf = '';
    }
  }

  /**
   * Remove an external VRF from a VRF configuration
   */
  public removeExternalVrf(vrfIndex: number, vrfToRemove: VrfAdminDtoExternalVrfsEnum): void {
    const vrf = this.vrfConfigurations[vrfIndex];
    if (!vrf.externalVrfs) {
      return;
    }

    const index = vrf.externalVrfs.indexOf(vrfToRemove);
    if (index > -1) {
      // If removing the default VRF, set a new default first
      if (vrf.defaultExternalVrf === (vrfToRemove as unknown as VrfAdminDtoDefaultExternalVrfEnum) && vrf.externalVrfs.length > 1) {
        const remainingVrfs = vrf.externalVrfs.filter(v => v !== vrfToRemove);
        vrf.defaultExternalVrf = remainingVrfs[0] as unknown as VrfAdminDtoDefaultExternalVrfEnum;
      }

      vrf.externalVrfs.splice(index, 1);

      // If no external VRFs left, clear the default
      if (vrf.externalVrfs.length === 0) {
        vrf.defaultExternalVrf = undefined;
      }
    }
  }

  /**
   * Set the default external VRF for a VRF configuration
   */
  public setDefaultExternalVrf(vrfIndex: number, defaultVrf: VrfAdminDtoExternalVrfsEnum): void {
    const vrf = this.vrfConfigurations[vrfIndex];
    if (vrf.externalVrfs && vrf.externalVrfs.includes(defaultVrf)) {
      vrf.defaultExternalVrf = defaultVrf as unknown as VrfAdminDtoDefaultExternalVrfEnum;
    }
  }

  /**
   * Check if an external VRF is the default for a VRF configuration
   */
  public isDefaultExternalVrf(vrfIndex: number, externalVrf: VrfAdminDtoExternalVrfsEnum): boolean {
    return this.vrfConfigurations[vrfIndex].defaultExternalVrf === (externalVrf as unknown as VrfAdminDtoDefaultExternalVrfEnum);
  }

  /**
   * Toggle the collapse state of a VRF configuration
   */
  public toggleVrfCollapse(index: number): void {
    if (index >= 0 && index < this.vrfCollapsedStates.length) {
      this.vrfCollapsedStates[index] = !this.vrfCollapsedStates[index];
    }
  }

  /**
   * Check if an external VRF can be removed (cannot remove if it's the default)
   */
  public canRemoveExternalVrf(vrfIndex: number, externalVrf: VrfAdminDtoExternalVrfsEnum): boolean {
    const vrf = this.vrfConfigurations[vrfIndex];
    if (!vrf.externalVrfs || vrf.externalVrfs.length <= 1) {
      return false; // Cannot remove if it's the only external VRF
    }

    // Cannot remove if it's the current default external VRF
    return !this.isDefaultExternalVrf(vrfIndex, externalVrf);
  }

  /**
   * Updates availability of HA options based on tenant size
   */
  private updateSizeBasedOptions(): void {
    const tenantSize = this.form.get('tenantSize').value;

    // For x-small or small tenants, update VRF configurations to restrict options
    if (tenantSize === 'x-small' || tenantSize === 'small') {
      this.vrfConfigurations.forEach(vrf => {
        // Apply any size-based restrictions here if needed
        vrf.maxExternalRoutes = Math.min(vrf.maxExternalRoutes || 1000, 500);
      });
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

      if (this.modalData.vcdTenantId) {
        this.form.controls.vcdTenantId.setValue(this.modalData.vcdTenantId);
      }

      // Update size-based options
      this.updateSizeBasedOptions();
    }

    this.ngx.resetModalData('tenantModal');
  }

  public reset(): void {
    this.submitted = false;
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

    // Initialize the form state
    this.updateSizeBasedOptions();
  }



  private createTenant(tenantAdminCreateDto: TenantAdminCreateDto): void {
    if (this.isAdminPortalMode) {
      this.tenantService.createOneV2Tenant({ tenantAdminCreateDto }).subscribe(() => {
        this.closeModal();
      });
    } else {
      // For non-admin mode, just close the modal for now
      this.closeModal();
    }
  }

  private editTenant(tenantAdminDto: TenantAdminDto): void {
    if (this.isAdminPortalMode) {
      this.tenantService.updateTenantAdmin({
        id: this.TenantId,
        tenantAdminDto
      }).subscribe(() => {
        this.closeModal();
      });
    } else {
      // For non-admin mode, just close the modal for now
      this.closeModal();
    }
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
      // tenantSize,
      vendorAgnosticNat,
      multiVrf,
      multiL3out,
      // vcdLocation,
      // vcdTenantType,
      // vcdTenantId,
    } = this.form.value;

    if (this.isAdminPortalMode) {
      if (this.ModalMode === ModalMode.Create) {
        const tenantAdminCreateDto: TenantAdminCreateDto = {
          name,
          description,
          alias,
          multiVrf,
          multiL3out,
          allowServiceGraphBypass: vendorAgnosticNat, // Map this field appropriately
          vrfs: multiVrf ? this.vrfConfigurations : [this.vrfConfigurations[0]], // Always include at least one VRF
        };

        this.createTenant(tenantAdminCreateDto);
      } else {
        const tenantAdminDto: TenantAdminDto = {
          name,
          description,
          alias,
          multiVrf,
          multiL3out,
          allowServiceGraphBypass: vendorAgnosticNat,
        };

        this.editTenant(tenantAdminDto);
      }
    } else {
      // Handle non-admin mode if still needed
      this.closeModal();
    }
  }
}

