import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { V2AppCentricVrfsService, Vrf } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { VrfModalDto } from 'src/app/models/appcentric/vrf-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';

@Component({
  selector: 'app-vrf-modal',
  templateUrl: './vrf-modal.component.html',
  styleUrls: ['./vrf-modal.component.css'],
})
export class VrfModalComponent implements OnInit {
  public ModalMode: ModalMode;
  public vrfId: string;
  public form: FormGroup;
  public submitted: boolean;
  public tenantId: string;

  constructor(
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
    private vrfService: V2AppCentricVrfsService,
    private router: Router,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const match = event.url.match(/\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\//);
        if (match) this.tenantId = match[1];
      }
    });
  }

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
      name: ['', Validators.compose([Validators.required, Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      alias: [null],
      description: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(500)])],
      policyControlEnforced: ['', Validators.required],
      policyControlEnforcementIngress: ['', Validators.required],
    });
  }

  private createVrf(vrf: Vrf): void {
    this.vrfService.createVrf({ vrf }).subscribe(
      () => {
        this.closeModal();
      },
      () => {},
    );
  }

  private editVrf(vrf: Vrf): void {
    vrf.name = null;
    this.vrfService
      .updateVrf({
        uuid: this.vrfId,
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
