import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { V2AppCentricVrfsService, Vrf } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { VrfModalDto } from 'src/app/models/appcentric/vrf-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';

@Component({
  selector: 'app-vrf-modal',
  templateUrl: './vrf-modal.component.html',
  styleUrls: ['./vrf-modal.component.css'],
})
export class VrfModalComponent implements OnInit {
  public ModalMode: ModalMode;
  public vrfId: string;
  public form: UntypedFormGroup;
  public submitted: boolean;
  @Input() public tenantId: string;

  constructor(private formBuilder: UntypedFormBuilder, private ngx: NgxSmartModalService, private vrfService: V2AppCentricVrfsService) {}

  ngOnInit(): void {
    this.buildForm();
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('vrfModal');
    this.reset();
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('vrfModal') as VrfModalDto);

    this.ModalMode = dto.ModalMode;
    if (this.ModalMode === ModalMode.Edit) {
      this.vrfId = dto.vrf.id;
    } else {
      this.form.controls.name.enable();
      this.form.controls.policyControlEnforced.setValue(true);
      this.form.controls.policyControlEnforcementIngress.setValue(true);
    }

    const vrf = dto.vrf;
    if (vrf !== undefined) {
      this.form.controls.name.setValue(vrf.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(vrf.description);
      this.form.controls.alias.setValue(vrf.alias);
      this.form.controls.policyControlEnforced.setValue(vrf.policyControlEnforced);
      this.form.controls.policyControlEnforcementIngress.setValue(vrf.policyControlEnforcementIngress);
    }
    this.ngx.resetModalData('vrfModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('vrfModal');
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      alias: ['', Validators.compose([Validators.maxLength(100)])],
      description: ['', Validators.compose([Validators.maxLength(500)])],
      policyControlEnforced: [null],
      policyControlEnforcementIngress: [null],
    });
  }

  private createVrf(vrf: Vrf): void {
    this.vrfService.createOneVrf({ vrf }).subscribe(
      () => {
        this.closeModal();
      },
      () => {},
    );
  }

  private editVrf(vrf: Vrf): void {
    vrf.name = null;
    vrf.tenantId = null;
    this.vrfService
      .updateOneVrf({
        id: this.vrfId,
        vrf,
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

    const { name, description, alias, policyControlEnforced, policyControlEnforcementIngress } = this.form.value;
    const tenantId = this.tenantId;
    const vrf = {
      name,
      description,
      alias,
      tenantId,
    } as Vrf;

    vrf.policyControlEnforced = policyControlEnforced === 'true';
    vrf.policyControlEnforcementIngress = policyControlEnforcementIngress === 'true';

    if (this.ModalMode === ModalMode.Create) {
      this.createVrf(vrf);
    } else {
      this.editVrf(vrf);
    }
  }
}
