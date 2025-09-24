import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Environment, EnvironmentExternalVrfsEnum, V3GlobalEnvironmentsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';

@Component({
  selector: 'app-environment-modal',
  templateUrl: './environment-modal.component.html',
  styleUrls: ['./environment-modal.component.scss'],
})
export class EnvironmentModalComponent implements OnInit {
  form: UntypedFormGroup;
  submitted = false;
  modalMode: ModalMode;
  environmentId: string;
  isLoading = false;

  // Available VRF options from the enum
  vrfOptions = [
    { value: EnvironmentExternalVrfsEnum.CmsEntsrvInet, label: EnvironmentExternalVrfsEnum.CmsEntsrvInet },
    { value: EnvironmentExternalVrfsEnum.CmsEntsrvLdapdns, label: EnvironmentExternalVrfsEnum.CmsEntsrvLdapdns },
    { value: EnvironmentExternalVrfsEnum.CmsEntsrvMgmt, label: EnvironmentExternalVrfsEnum.CmsEntsrvMgmt },
    { value: EnvironmentExternalVrfsEnum.CmsEntsrvMon, label: EnvironmentExternalVrfsEnum.CmsEntsrvMon },
    { value: EnvironmentExternalVrfsEnum.CmsEntsrvPres, label: EnvironmentExternalVrfsEnum.CmsEntsrvPres },
    { value: EnvironmentExternalVrfsEnum.CmsEntsrvSec, label: EnvironmentExternalVrfsEnum.CmsEntsrvSec },
    { value: EnvironmentExternalVrfsEnum.CmsEntsrvVpn, label: EnvironmentExternalVrfsEnum.CmsEntsrvVpn },
    { value: EnvironmentExternalVrfsEnum.CmsnetAppdev, label: EnvironmentExternalVrfsEnum.CmsnetAppdev },
    { value: EnvironmentExternalVrfsEnum.CmsnetAppprod, label: EnvironmentExternalVrfsEnum.CmsnetAppprod },
    { value: EnvironmentExternalVrfsEnum.CmsnetDatadev, label: EnvironmentExternalVrfsEnum.CmsnetDatadev },
    { value: EnvironmentExternalVrfsEnum.CmsnetDataprod, label: EnvironmentExternalVrfsEnum.CmsnetDataprod },
    { value: EnvironmentExternalVrfsEnum.CmsnetEdcVpn, label: EnvironmentExternalVrfsEnum.CmsnetEdcVpn },
    { value: EnvironmentExternalVrfsEnum.CmsnetEdcmgmt, label: EnvironmentExternalVrfsEnum.CmsnetEdcmgmt },
    { value: EnvironmentExternalVrfsEnum.CmsnetPresdev, label: EnvironmentExternalVrfsEnum.CmsnetPresdev },
    { value: EnvironmentExternalVrfsEnum.CmsnetPresprod, label: EnvironmentExternalVrfsEnum.CmsnetPresprod },
    { value: EnvironmentExternalVrfsEnum.CmsnetSec, label: EnvironmentExternalVrfsEnum.CmsnetSec },
    { value: EnvironmentExternalVrfsEnum.CmsnetTransport, label: EnvironmentExternalVrfsEnum.CmsnetTransport },
  ];

  constructor(
    private environmentService: V3GlobalEnvironmentsService,
    private formBuilder: UntypedFormBuilder,
    private ngx: NgxSmartModalService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('environmentModal') as any);
    this.modalMode = dto.ModalMode;

    console.log('Modal Data:', dto); // Debug log
    console.log('Modal Mode:', this.modalMode); // Debug log

    if (this.modalMode === ModalMode.Edit && dto.environment) {
      this.environmentId = dto.environment.id;
      console.log('Environment ID:', this.environmentId); // Debug log
      this.loadEnvironment(dto.environment.id);
    } else if (this.modalMode === ModalMode.Create) {
      this.form.reset();
      this.form.enable();
    }

    this.ngx.resetModalData('environmentModal');
  }

  private loadEnvironment(id: string): void {
    this.isLoading = true;
    this.environmentService.getOneEnvironment({ id }).subscribe({
      next: environment => {
        this.form.patchValue({
          name: environment.name,
          description: environment.description,
          externalVrfs: environment.externalVrfs || [],
        });
        this.form.enable();

        // Disable name field when editing (name should not be editable)
        if (this.modalMode === ModalMode.Edit) {
          this.form.get('name')?.disable();
        }

        this.isLoading = false;
      },
      error: error => {
        console.error('Error loading environment:', error);
        this.isLoading = false;
      },
    });
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('environmentModal');
    this.reset();
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('environmentModal');
    this.buildForm();
    this.isLoading = false;
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      description: ['', Validators.compose([Validators.required, Validators.maxLength(500)])],
      externalVrfs: [[], Validators.required],
    });
  }

  private createEnvironment(environment: Partial<Environment>): void {
    this.environmentService.createOneEnvironment({ environment: environment as Environment }).subscribe({
      next: () => {
        this.closeModal();
      },
      error: error => {
        console.error('Error creating environment:', error);
        this.submitted = false;
      },
    });
  }

  private updateEnvironment(environment: Partial<Environment>): void {
    this.environmentService
      .updateOneEnvironment({
        id: this.environmentId,
        environment: environment as Environment,
      })
      .subscribe({
        next: () => {
          this.closeModal();
        },
        error: error => {
          console.error('Error updating environment:', error);
          this.submitted = false;
        },
      });
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    console.log('Save - Modal Mode:', this.modalMode); // Debug log
    console.log('Save - Environment ID:', this.environmentId); // Debug log

    const { name, description, externalVrfs } = this.form.getRawValue(); // Use getRawValue to include disabled fields
    const environment = {
      name,
      description,
      externalVrfs,
      lastRouteSyncAt: new Date().toISOString(),
    };

    if (this.modalMode === ModalMode.Create) {
      console.log('Creating environment:', environment); // Debug log
      this.createEnvironment(environment);
    } else if (this.modalMode === ModalMode.Edit) {
      console.log('Updating environment:', environment, 'ID:', this.environmentId); // Debug log
      this.updateEnvironment(environment);
    } else {
      console.error('Unknown modal mode:', this.modalMode); // Debug log
    }
  }

  public addVrf(vrf: string): void {
    const currentVrfs = this.form.get('externalVrfs')?.value || [];

    if (!currentVrfs.includes(vrf)) {
      this.form.get('externalVrfs')?.setValue([...currentVrfs, vrf]);
    }
  }

  public getSelectedVrfs(): string[] {
    return this.form.get('externalVrfs')?.value || [];
  }

  public getAvailableVrfs(): Array<{ value: string; label: string }> {
    const selectedVrfs = this.getSelectedVrfs();
    return this.vrfOptions.filter(vrf => !selectedVrfs.includes(vrf.value));
  }

  public getVrfLabel(vrfValue: string): string {
    const vrf = this.vrfOptions.find(v => v.value === vrfValue);
    return vrf ? vrf.label : vrfValue;
  }
}
