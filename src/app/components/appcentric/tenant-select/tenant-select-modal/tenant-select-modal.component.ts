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
  VrfAdminDtoDefaultExternalVrfEnum,
  Environment,
  V3GlobalEnvironmentService,
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
  public environments: Environment[] = [];
  public isLoadingEnvironments = false;

  // Help text for tooltips
  public helpText: TenantSelectModalHelpText;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private ngx: NgxSmartModalService,
    private tenantService: AdminV2AppCentricTenantsService,
    private environmentService: V3GlobalEnvironmentService,
    helpText: TenantSelectModalHelpText,
  ) {
    this.helpText = helpText;
  }

  ngOnInit(): void {
    this.determineApplicationMode();
    this.initializeExternalConnectivityOptions();
    this.buildForm();
    this.initializeVrfConfigurations();
    this.loadEnvironments();
  }

  /**
   * Initialize external connectivity options from VrfExternalVrfsEnum
   */
  private initializeExternalConnectivityOptions(): void {
    this.externalConnectivityOptions = Object.values(VrfExternalVrfsEnum);
  }

  /**
   * Load available environments from the API
   */
  private loadEnvironments(): void {
    this.isLoadingEnvironments = true;
    this.environmentService.getManyEnvironments().subscribe({
      next: environments => {
        this.environments = environments;
        this.isLoadingEnvironments = false;
      },
      error: error => {
        console.error('Error loading environments:', error);
        this.isLoadingEnvironments = false;
      },
    });
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
      autoSelectInternalBgpAsn: true,
      autoSelectExternalBgpAsn: true,
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
   * Filters based on selected environment if available
   */
  public getAvailableExternalVrfs(vrfIndex: number): Array<{ value: VrfAdminDtoExternalVrfsEnum; label: string }> {
    const selectedVrfs = this.vrfConfigurations[vrfIndex].externalVrfs || [];
    let availableVrfs = Object.values(VrfAdminDtoExternalVrfsEnum);

    // Filter based on selected environment
    const selectedEnvironmentId = this.form.get('environmentId')?.value;
    if (selectedEnvironmentId) {
      const selectedEnvironment = this.environments.find(env => env.id === selectedEnvironmentId);
      if (selectedEnvironment && selectedEnvironment.externalVrfs) {
        // Only show VRFs that are available in the selected environment
        const environmentVrfs = selectedEnvironment.externalVrfs.map(vrf => vrf as unknown as VrfAdminDtoExternalVrfsEnum);
        availableVrfs = availableVrfs.filter(vrf => environmentVrfs.includes(vrf));
      }
    }

    return availableVrfs.filter(vrf => !selectedVrfs.includes(vrf)).map(vrf => ({ value: vrf, label: vrf }));
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
   * Get selected external VRFs for a VRF configuration
   */
  public getSelectedExternalVrfs(vrfIndex: number): VrfAdminDtoExternalVrfsEnum[] {
    return this.vrfConfigurations[vrfIndex].externalVrfs || [];
  }

  /**
   * Toggle default VRF status (checkbox behavior)
   */
  public toggleDefaultExternalVrf(vrfIndex: number, externalVrf: VrfAdminDtoExternalVrfsEnum): void {
    const vrf = this.vrfConfigurations[vrfIndex];
    if (this.isDefaultExternalVrf(vrfIndex, externalVrf)) {
      // Unset as default
      vrf.defaultExternalVrf = undefined;
    } else {
      // Set as default
      vrf.defaultExternalVrf = externalVrf as unknown as VrfAdminDtoDefaultExternalVrfEnum;
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

      // Environment selection will default to empty and be required

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

      // Environment selection (required)
      environmentId: ['', Validators.required],

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

    // Watch for environment changes and filter VRFs accordingly
    this.form.get('environmentId').valueChanges.subscribe(() => {
      this.filterVrfsBasedOnEnvironment();
    });

    // New form control handlers
    this.form.get('tenantSize').valueChanges.subscribe(() => {
      this.updateSizeBasedOptions();
    });

    // Initialize the form state
    this.updateSizeBasedOptions();
  }

  /**
   * Filter VRF configurations based on selected environment
   */
  private filterVrfsBasedOnEnvironment(): void {
    const selectedEnvironmentId = this.form.get('environmentId')?.value;
    if (!selectedEnvironmentId) {
      return;
    }

    const selectedEnvironment = this.environments.find(env => env.id === selectedEnvironmentId);
    if (!selectedEnvironment || !selectedEnvironment.externalVrfs) {
      return;
    }

    const environmentVrfs = selectedEnvironment.externalVrfs.map(vrf => vrf as unknown as VrfAdminDtoExternalVrfsEnum);

    // Filter each VRF configuration to remove VRFs not available in the environment
    this.vrfConfigurations.forEach(vrf => {
      if (vrf.externalVrfs) {
        // Remove VRFs that are not available in the selected environment
        vrf.externalVrfs = vrf.externalVrfs.filter(extVrf => environmentVrfs.includes(extVrf));

        // Clear default if it's no longer available
        if (vrf.defaultExternalVrf && !environmentVrfs.includes(vrf.defaultExternalVrf as unknown as VrfAdminDtoExternalVrfsEnum)) {
          vrf.defaultExternalVrf = undefined;
        }
      }
    });
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
      this.tenantService
        .updateTenantAdmin({
          id: this.TenantId,
          tenantAdminDto,
        })
        .subscribe(() => {
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

    // Validate VRF ASN selections: for each VRF, require either auto-select OR a valid ASN for both internal and external
    const isValidAsn = (value?: number) => typeof value === 'number' && value >= 1 && value <= 4294967295;
    const vrfValidationFailed = this.vrfConfigurations.some(vrf => {
      const internalOk = vrf.autoSelectInternalBgpAsn === true || isValidAsn(vrf.internalBgpAsn);
      const externalOk = vrf.autoSelectExternalBgpAsn === true || isValidAsn(vrf.externalBgpAsn);
      return !internalOk || !externalOk;
    });

    if (vrfValidationFailed) {
      return;
    }

    const {
      name,
      description,
      alias,
      environmentId,
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
          environmentId,
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
          environmentId,
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

  // BGP ASN helpers for template bindings
  public onInternalAutoSelectChange(vrf: VrfAdminDto): void {
    if (vrf.autoSelectInternalBgpAsn) {
      vrf.internalBgpAsn = undefined;
    }
  }

  public onExternalAutoSelectChange(vrf: VrfAdminDto): void {
    if (vrf.autoSelectExternalBgpAsn) {
      vrf.externalBgpAsn = undefined;
    }
  }

  public onInternalAsnInput(vrf: VrfAdminDto): void {
    if (vrf.internalBgpAsn !== undefined && vrf.internalBgpAsn !== null && (vrf.internalBgpAsn as any) !== '') {
      vrf.autoSelectInternalBgpAsn = false;
    }
  }

  public onExternalAsnInput(vrf: VrfAdminDto): void {
    if (vrf.externalBgpAsn !== undefined && vrf.externalBgpAsn !== null && (vrf.externalBgpAsn as any) !== '') {
      vrf.autoSelectExternalBgpAsn = false;
    }
  }

  public internalAsnInvalid(vrf: VrfAdminDto): boolean {
    if (vrf.autoSelectInternalBgpAsn) {
      return false;
    }
    const value = vrf.internalBgpAsn as any;
    const num = typeof value === 'string' ? Number(value) : value;
    return !(typeof num === 'number' && !isNaN(num) && num >= 1 && num <= 4294967295);
  }

  public externalAsnInvalid(vrf: VrfAdminDto): boolean {
    if (vrf.autoSelectExternalBgpAsn) {
      return false;
    }
    const value = vrf.externalBgpAsn as any;
    const num = typeof value === 'string' ? Number(value) : value;
    return !(typeof num === 'number' && !isNaN(num) && num >= 1 && num <= 4294967295);
  }
}
