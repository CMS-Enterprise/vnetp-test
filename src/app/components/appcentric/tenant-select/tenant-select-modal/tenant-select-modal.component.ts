import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Tenant, V2AppCentricTenantsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { TenantModalDto } from 'src/app/models/appcentric/tenant-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { applicationMode } from 'src/app/models/other/application-mode-enum';
import { NameValidator } from 'src/app/validators/name-validator';

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
  public currentMode: applicationMode;
  public modalData: TenantModalDto;
  public selectedFile: File = null;
  public firewallVendorOptions = ['ASA', 'PANOS'];
  public firewallArchitectureOptions = ['Physical', 'Virtual'];
  public haModesOptions = ['Active-Passive', 'Active-Active'];
  public datacenterOptions = ['East', 'West'];
  public deploymentModeOptions = ['Hot Site First', 'Cold Site First', 'Scheduled Sync'];

  // Help text for tooltips
  public helpText = {
    NorthSouthAppId: 'Allow PANOS App-ID (requires PANOS firewall vendor)',
    EastWestAppId: 'Allow PANOS App-ID (requires PANOS firewall vendor)',
    Nat64NorthSouth: 'Enable NAT64 and DNS64 functionality for IPv6-to-IPv4 communication on the north/south firewall',
    EastWestAllowSgBypass: 'Allows tenant to define additional contract subjects and filters that bypass the service graph',
    EastWestNat:
      'Create host subnets in source EPG when firewall performs source NAT and host subnets in dest EPG when firewall performs dest NAT',
    TenantSize:
      'X-Small: Small virtual firewall, limited VCD resources\n' +
      'Small: Basic virtual firewall, standard VCD resources\n' +
      'Medium: Mid-size virtual firewall, enhanced VCD resources\n' +
      'Large: High-capacity virtual firewall, advanced VCD resources\n' +
      'X-Large: Maximum capacity virtual firewall, premium VCD resources',
    HighAvailability: 'Enable redundant firewall deployment for high availability and failover protection',
    HAMode: 'Active-Passive: One active firewall with passive standby\nActive-Active: Both firewalls actively processing traffic',
    VendorAgnosticNat:
      'Adds a UI option when creating NAT rules that generates a corresponding firewall rule ' +
      'to match NAT traffic and uses a vendor-agnostic firewall automation strategy that ' +
      'handles differences in processing flow between ASA and PANOS',
    RegionalHA: 'Configure high availability across multiple datacenter regions',
    DeploymentMode:
      'Hot Site First: Deploy to primary site first, then secondary\nCold Site First: Deploy to secondary site first, then primary\nScheduled Sync: Schedule regular synchronization between sites\n\nNote: A failure in the secondary deployment will halt the workflow and rollback the changes to the secondary environment.',
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private ngx: NgxSmartModalService,
    private tenantService: V2AppCentricTenantsService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.determineApplicationMode();
  }

  /**
   * Updates App-ID checkbox values based on firewall vendor selections
   */
  private updateAppIdAvailability(): void {
    // Handle North/South App-ID
    const northSouthVendor = this.form.get('northSouthFirewallVendor').value;
    if (northSouthVendor !== 'PANOS') {
      this.form.get('northSouthAppId').setValue(false);
      this.form.get('northSouthAppId').disable();
    } else {
      this.form.get('northSouthAppId').enable();
    }

    // Handle East/West App-ID
    const eastWestVendor = this.form.get('eastWestFirewallVendor').value;
    if (eastWestVendor !== 'PANOS') {
      this.form.get('eastWestAppId').setValue(false);
      this.form.get('eastWestAppId').disable();
    } else {
      this.form.get('eastWestAppId').enable();
    }
  }

  /**
   * Updates availability of HA options based on tenant size
   */
  private updateSizeBasedOptions(): void {
    const tenantSize = this.form.get('tenantSize').value;

    // For x-small or small tenants, restrict east/west firewall architecture to Virtual and disable HA
    if (tenantSize === 'x-small' || tenantSize === 'small') {
      this.form.get('eastWestFirewallArchitecture').setValue('Virtual');
      this.form.get('eastWestFirewallArchitecture').disable();

      this.form.get('eastWestHa').setValue(false);
      this.form.get('eastWestHa').disable();

      // Since HA is disabled, also disable HA mode
      this.form.get('eastWestHaMode').disable();
    } else {
      this.form.get('eastWestFirewallArchitecture').enable();
      this.form.get('eastWestHa').enable();

      // Update HA mode availability based on eastWestHa value
      this.updateHaModeAvailability('eastWestHa', 'eastWestHaMode');
    }
  }

  /**
   * Updates HA mode availability based on HA checkbox state
   */
  private updateHaModeAvailability(haControlName: string, haModeControlName: string): void {
    const haEnabled = this.form.get(haControlName).value;

    if (haEnabled) {
      this.form.get(haModeControlName).enable();
    } else {
      this.form.get(haModeControlName).disable();
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
    // Check route data for application mode
    this.route.data.subscribe(data => {
      if (data && data.mode) {
        this.currentMode = data.mode;
        this.isAdminPortalMode = this.currentMode === applicationMode.ADMINPORTAL;
        this.isTenantV2Mode = this.currentMode === applicationMode.TENANTV2;
      } else {
        // Fallback to checking URL path
        this.isAdminPortalMode = this.router.url.includes('adminportal');
        this.isTenantV2Mode = this.router.url.includes('tenant-v2');
      }
    });
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('tenantModal');
    this.reset();
  }

  public getData(): void {
    console.log('get data when modal is opened URL ', this.router.url);
    this.modalData = Object.assign({}, this.ngx.getModalData('tenantModal') as TenantModalDto);

    this.ModalMode = this.modalData.ModalMode;
    this.isAdminPortalMode = this.modalData.isAdminPortalMode;
    this.isTenantV2Mode = this.modalData.isTenantV2Mode;

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
      this.form.controls.northSouthFirewallVendor.setValue(this.modalData.northSouthFirewallVendor || 'PANOS');
      this.form.controls.northSouthFirewallArchitecture.setValue(this.modalData.northSouthFirewallArchitecture || 'Virtual');
      this.form.controls.northSouthHa.setValue(this.modalData.northSouthHa !== false);
      this.form.controls.northSouthHaMode.setValue(this.modalData.northSouthHaMode || 'Active-Passive');
      this.form.controls.eastWestFirewallVendor.setValue(this.modalData.eastWestFirewallVendor || 'PANOS');
      this.form.controls.eastWestFirewallArchitecture.setValue(this.modalData.eastWestFirewallArchitecture || 'Virtual');
      this.form.controls.eastWestHa.setValue(this.modalData.eastWestHa !== false);
      this.form.controls.eastWestHaMode.setValue(this.modalData.eastWestHaMode || 'Active-Passive');
      this.form.controls.vcdLocation.setValue(this.modalData.vcdLocation || 'VCD-East');
      this.form.controls.vcdTenantType.setValue(this.modalData.vcdTenantType || 'new');

      this.form.controls.regionalHa.setValue(this.modalData.regionalHa || false);
      this.form.controls.primaryDatacenter.setValue(this.modalData.primaryDatacenter || 'East');
      this.form.controls.secondaryDatacenter.setValue(this.modalData.secondaryDatacenter || '');
      this.form.controls.deploymentMode.setValue(this.modalData.deploymentMode || 'Hot Site First');

      if (this.modalData.vcdTenantId) {
        this.form.controls.vcdTenantId.setValue(this.modalData.vcdTenantId);
      }

      // Set feature flags
      if (this.modalData.featureFlags) {
        this.form.controls.northSouthAppId.setValue(this.modalData.featureFlags.northSouthAppId);
        this.form.controls.eastWestAppId.setValue(this.modalData.featureFlags.eastWestAppId);
        this.form.controls.nat64NorthSouth.setValue(this.modalData.featureFlags.nat64NorthSouth !== false);
        this.form.controls.eastWestAllowSgBypass.setValue(this.modalData.featureFlags.eastWestAllowSgBypass);
        this.form.controls.eastWestNat.setValue(this.modalData.featureFlags.eastWestNat);
      }

      // Update App-ID availability based on current firewall vendor selections
      this.updateAppIdAvailability();

      // Update size-based options
      this.updateSizeBasedOptions();

      // Update HA mode availability
      this.updateHaModeAvailability('northSouthHa', 'northSouthHaMode');
      this.updateHaModeAvailability('eastWestHa', 'eastWestHaMode');

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
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      alias: ['', Validators.compose([Validators.maxLength(100)])],
      description: ['', Validators.compose([Validators.maxLength(500)])],

      // Base tenant options
      tenantSize: ['medium'],
      vendorAgnosticNat: [false],

      // AdminPortal specific fields
      northSouthFirewallVendor: ['PANOS'],
      northSouthFirewallArchitecture: ['Virtual'],
      northSouthHa: [true],
      northSouthHaMode: ['Active-Passive'],
      eastWestFirewallVendor: ['PANOS'],
      eastWestFirewallArchitecture: ['Virtual'],
      eastWestHa: [true],
      eastWestHaMode: ['Active-Passive'],

      // Regional HA options
      regionalHa: [false],
      primaryDatacenter: ['East'],
      secondaryDatacenter: [''],
      deploymentMode: ['Hot Site First'],

      // VMWare Cloud Director Integration
      vcdLocation: ['VCD-East'],
      vcdTenantType: ['new'],
      vcdTenantId: [''],

      // Feature flags
      northSouthAppId: [true],
      eastWestAppId: [true],
      nat64NorthSouth: [true],
      eastWestAllowSgBypass: [false],
      eastWestNat: [false],
    });

    // Set up form control value change handlers
    this.form.get('northSouthFirewallVendor').valueChanges.subscribe(value => {
      if (value !== 'PANOS') {
        this.form.get('northSouthAppId').setValue(false);
        this.form.get('northSouthAppId').disable();
      } else {
        this.form.get('northSouthAppId').enable();
      }
    });

    this.form.get('eastWestFirewallVendor').valueChanges.subscribe(value => {
      if (value !== 'PANOS') {
        this.form.get('eastWestAppId').setValue(false);
        this.form.get('eastWestAppId').disable();
      } else {
        this.form.get('eastWestAppId').enable();
      }
    });

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

    this.form.get('northSouthHa').valueChanges.subscribe(() => {
      this.updateHaModeAvailability('northSouthHa', 'northSouthHaMode');
    });

    this.form.get('eastWestHa').valueChanges.subscribe(() => {
      this.updateHaModeAvailability('eastWestHa', 'eastWestHaMode');
    });

    this.form.get('regionalHa').valueChanges.subscribe(() => {
      this.updateRegionalHaOptions();
    });

    this.form.get('primaryDatacenter').valueChanges.subscribe(() => {
      this.validateDatacenterSelection();
    });

    this.form.get('secondaryDatacenter').valueChanges.subscribe(() => {
      this.updateDeploymentModeVisibility();
    });

    // Initialize the form state
    this.updateSizeBasedOptions();
    this.updateHaModeAvailability('northSouthHa', 'northSouthHaMode');
    this.updateHaModeAvailability('eastWestHa', 'eastWestHaMode');
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
      this.tenantService.createOneV2TenantTenant({ createTenantV2Dto: { name: tenant.name } }).subscribe(
        () => {
          this.closeModal();
        },
        () => {},
      );
    } else {
      this.tenantService.createOneTenant({ tenant }).subscribe(
        () => {
          this.closeModal();
        },
        () => {},
      );
    }
  }

  private editTenant(tenant: Tenant): void {
    delete tenant.name;
    this.tenantService
      .updateOneTenant({
        id: this.TenantId,
        tenant,
      })
      .subscribe(
        () => {
          this.closeModal();
        },
        () => {},
      );
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
      northSouthFirewallVendor,
      northSouthFirewallArchitecture,
      northSouthHa,
      northSouthHaMode,
      eastWestFirewallVendor,
      eastWestFirewallArchitecture,
      eastWestHa,
      eastWestHaMode,
      regionalHa,
      primaryDatacenter,
      secondaryDatacenter,
      deploymentMode,
      vcdLocation,
      vcdTenantType,
      vcdTenantId,
      northSouthAppId,
      eastWestAppId,
      nat64NorthSouth,
      eastWestAllowSgBypass,
      eastWestNat,
    } = this.form.value;

    const tenant = {
      name,
      description,
      alias,
    } as Tenant;

    if (this.isAdminPortalMode) {
      tenant.tenantVersion = 2;

      // Add AdminPortal specific properties
      // Note: These would normally be added to a tenant configuration object or metadata
      // But for now we'll just log them
      console.log('AdminPortal Tenant Configuration:', {
        tenantSize,
        vendorAgnosticNat,
        northSouthFirewallVendor,
        northSouthFirewallArchitecture,
        northSouthHa,
        northSouthHaMode: northSouthHa ? northSouthHaMode : null,
        eastWestFirewallVendor,
        eastWestFirewallArchitecture,
        eastWestHa,
        eastWestHaMode: eastWestHa ? eastWestHaMode : null,
        regionalHa,
        primaryDatacenter: regionalHa ? primaryDatacenter : null,
        secondaryDatacenter: regionalHa && secondaryDatacenter ? secondaryDatacenter : null,
        deploymentMode: regionalHa && secondaryDatacenter ? deploymentMode : null,
        vcdLocation,
        vcdTenantType,
        vcdTenantId: vcdTenantType === 'existing' ? vcdTenantId : null,
        featureFlags: {
          northSouthAppId,
          eastWestAppId,
          nat64NorthSouth,
          eastWestAllowSgBypass,
          eastWestNat,
        },
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
