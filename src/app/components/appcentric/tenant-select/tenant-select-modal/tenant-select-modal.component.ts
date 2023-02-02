import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Tenant, V2AppCentricTenantsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { TenantModalDto } from 'src/app/models/appcentric/tenant-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';

@Component({
  selector: 'app-tenant-select-modal',
  templateUrl: './tenant-select-modal.component.html',
  styleUrls: ['./tenant-select-modal.component.css'],
})
export class TenantSelectModalComponent implements OnInit {
  public ModalMode: ModalMode;
  public TenantId: string;
  public form: FormGroup;
  public submitted: boolean;

  constructor(private formBuilder: FormBuilder, private ngx: NgxSmartModalService, private tenantService: V2AppCentricTenantsService) {}

  ngOnInit(): void {
    this.buildForm();
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('tenantModal');
    this.reset();
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('tenantModal') as TenantModalDto);

    this.ModalMode = dto.ModalMode;
    if (this.ModalMode === ModalMode.Edit) {
      this.TenantId = dto.Tenant.id;
    } else {
      this.form.controls.name.enable();
    }

    const tenant = dto.Tenant;
    if (tenant !== undefined) {
      this.form.controls.name.setValue(tenant.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(tenant.description);
      this.form.controls.alias.setValue(tenant.alias);
    }
    this.ngx.resetModalData('tenantModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('tenantModal');
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      alias: [null],
      description: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(500)])],
    });
  }

  private createTenant(tenant: Tenant): void {
    this.tenantService.createTenant({ tenant }).subscribe(
      () => {
        this.closeModal();
      },
      () => {},
    );
  }

  private editTenant(tenant: Tenant): void {
    tenant.name = null;
    this.tenantService
      .updateTenant({
        uuid: this.TenantId,
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

    const { name, description, alias } = this.form.value;
    const tenant = {
      name,
      description,
      alias,
    } as Tenant;

    if (this.ModalMode === ModalMode.Create) {
      this.createTenant(tenant);
    } else {
      this.editTenant(tenant);
    }
  }
}
