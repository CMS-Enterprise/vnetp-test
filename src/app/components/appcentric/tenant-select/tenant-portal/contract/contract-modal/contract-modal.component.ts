import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { V2AppCentricContractsService, Contract } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ContractModalDto } from 'src/app/models/appcentric/contract-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';

@Component({
  selector: 'app-contract-modal',
  templateUrl: './contract-modal.component.html',
  styleUrls: ['./contract-modal.component.css'],
})
export class ContractModalComponent implements OnInit {
  public modalMode: ModalMode;
  public contractId: string;
  public form: FormGroup;
  public submitted: boolean;
  public tenantId: string;

  constructor(
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
    private contractService: V2AppCentricContractsService,
    private router: Router,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const match = event.url.match(/\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\//);
        if (match) {
          this.tenantId = match[1];
        }
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
    this.ngx.close('contractModal');
    this.reset();
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('contractModal') as ContractModalDto);

    this.modalMode = dto.modalMode;
    if (this.modalMode === ModalMode.Edit) {
      this.contractId = dto.contract.id;
    } else {
      this.form.controls.name.enable();
    }

    const contract = dto.contract;
    if (contract !== undefined) {
      this.form.controls.name.setValue(contract.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(contract.description);
      this.form.controls.alias.setValue(contract.alias);
    }
    this.ngx.resetModalData('contractModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('contractModal');
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      alias: ['', Validators.compose([Validators.maxLength(100)])],
      description: ['', Validators.compose([Validators.maxLength(500)])],
    });
  }

  private createContract(contract: Contract): void {
    this.contractService.createContract({ contract }).subscribe(
      () => {
        this.closeModal();
      },
      () => {},
    );
  }

  private editContract(contract: Contract): void {
    contract.name = null;
    this.contractService
      .updateContract({
        uuid: this.contractId,
        contract,
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

    const { name, description, alias, scope } = this.form.value;
    const tenantId = this.tenantId;
    const contract = {
      name,
      description,
      alias,
      tenantId,
    } as Contract;

    if (this.modalMode === ModalMode.Create) {
      this.createContract(contract);
    } else {
      this.editContract(contract);
    }
  }
}
