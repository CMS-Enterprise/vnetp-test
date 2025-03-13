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
      this.form.controls.eastWestFirewallVendor.setValue(this.modalData.eastWestFirewallVendor || 'PANOS');
      this.form.controls.eastWestFirewallArchitecture.setValue(this.modalData.eastWestFirewallArchitecture || 'Virtual');
      this.form.controls.eastWestHa.setValue(this.modalData.eastWestHa !== false);
      this.form.controls.vcdLocation.setValue(this.modalData.vcdLocation || 'VCD-East');
      this.form.controls.vcdTenantType.setValue(this.modalData.vcdTenantType || 'new');

      if (this.modalData.vcdTenantId) {
        this.form.controls.vcdTenantId.setValue(this.modalData.vcdTenantId);
      }

      // Set feature flags
      if (this.modalData.featureFlags) {
        this.form.controls.northSouthAppId.setValue(this.modalData.featureFlags.northSouthAppId);
        this.form.controls.eastWestAppId.setValue(this.modalData.featureFlags.eastWestAppId);
        this.form.controls.nat64NorthSouth.setValue(this.modalData.featureFlags.nat64NorthSouth);
        this.form.controls.eastWestAllowSgBypass.setValue(this.modalData.featureFlags.eastWestAllowSgBypass);
        this.form.controls.eastWestNat.setValue(this.modalData.featureFlags.eastWestNat);
      }

      // Update App-ID availability based on current firewall vendor selections
      this.updateAppIdAvailability();
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

      // AdminPortal specific fields
      northSouthFirewallVendor: ['PANOS'],
      northSouthFirewallArchitecture: ['Virtual'],
      northSouthHa: [true],
      eastWestFirewallVendor: ['PANOS'],
      eastWestFirewallArchitecture: ['Virtual'],
      eastWestHa: [true],

      // VMWare Cloud Director Integration
      vcdLocation: ['VCD-East'],
      vcdTenantType: ['new'],
      vcdTenantId: [''],

      // Feature flags
      northSouthAppId: [true],
      eastWestAppId: [true],
      nat64NorthSouth: [false],
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
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
    }
  }

  private createTenant(tenant: Tenant): void {
    this.tenantService.createOneTenant({ tenant }).subscribe(
      () => {
        this.closeModal();
      },
      () => {},
    );
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
      northSouthFirewallVendor,
      northSouthFirewallArchitecture,
      northSouthHa,
      eastWestFirewallVendor,
      eastWestFirewallArchitecture,
      eastWestHa,
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
        northSouthFirewallVendor,
        northSouthFirewallArchitecture,
        northSouthHa,
        eastWestFirewallVendor,
        eastWestFirewallArchitecture,
        eastWestHa,
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
