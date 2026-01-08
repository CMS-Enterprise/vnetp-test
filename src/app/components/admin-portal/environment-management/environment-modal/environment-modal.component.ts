import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Environment, ExternalVrf, V3GlobalEnvironmentsService, V3GlobalExternalVrfsService } from 'client';
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
  vrfOptions: { value: string; label: string }[] = [];

  constructor(
    private environmentService: V3GlobalEnvironmentsService,
    private externalVrfService: V3GlobalExternalVrfsService,
    private formBuilder: UntypedFormBuilder,
    private ngx: NgxSmartModalService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  getVrfOptions(usedVrfs?: string[]): void {
    this.externalVrfService.getManyExternalVrf({ limit: 1000 }).subscribe(vrfs => {
      if ((vrfs as unknown as ExternalVrf[]).length > 0) {
        this.vrfOptions = (vrfs as unknown as ExternalVrf[]).map(vrf => ({
          value: vrf.id,
          label: vrf.name,
        }));
        if (usedVrfs) {
          this.vrfOptions = this.vrfOptions.filter(vrf => !usedVrfs.includes(vrf.label));
        }
      }
    });
  }

  getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('environmentModal') as any);
    this.modalMode = dto.ModalMode;

    if (this.modalMode === ModalMode.Edit && dto.environment) {
      this.environmentId = dto.environment.id;
      this.loadEnvironment(dto.environment.id);
    } else if (this.modalMode === ModalMode.Create) {
      this.getVrfOptions();
      this.form.reset();
      this.form.enable();
    }

    this.ngx.resetModalData('environmentModal');
  }

  private loadEnvironment(id: string): void {
    this.isLoading = true;
    this.environmentService.getOneEnvironment({ id, relations: ['externalVrfs'] }).subscribe({
      next: environment => {
        const externalVrfsNames = environment.externalVrfs.map(vrf => vrf.name);
        this.form.patchValue({
          name: environment.name,
          description: environment.description,
          externalVrfs: externalVrfsNames || [],
        });
        this.getVrfOptions(externalVrfsNames);
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

    const { name, description, externalVrfs } = this.form.getRawValue(); // Use getRawValue to include disabled fields
    const externalVrfsIds = externalVrfs.map(vrf => ({ id: vrf }));
    const environment = {
      name,
      description,
      externalVrfs: externalVrfsIds,
      lastRouteSyncAt: new Date().toISOString(),
    };

    if (this.modalMode === ModalMode.Create) {
      this.createEnvironment(environment);
    } else if (this.modalMode === ModalMode.Edit) {
      this.updateEnvironment(environment);
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
