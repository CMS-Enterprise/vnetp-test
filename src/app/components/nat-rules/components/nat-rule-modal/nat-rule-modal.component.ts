import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NameValidator } from 'src/app/validators/name-validator';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NatRuleModalDto } from '../../models/nat-rule-modal-dto';

@Component({
  selector: 'app-nat-rule-modal',
  templateUrl: './nat-rule-modal.component.html',
})
export class NatRuleModalComponent implements OnInit {
  public form: FormGroup;
  public submitted = false;

  constructor(private formBuilder: FormBuilder, private ngx: NgxSmartModalService) {}

  get f() {
    return this.form.controls;
  }

  public ngOnInit(): void {
    this.initForm();
  }

  public initNatRule(): void {
    this.initForm();

    const dto = Object.assign({}, this.ngx.getModalData('natRuleModal') as NatRuleModalDto);

    if (dto.modalMode === ModalMode.Edit) {
      const { name } = dto.natRule;

      this.f.name.setValue(name);
      this.f.name.disable();
    }
  }

  public closeModal(): void {
    this.reset();
    this.ngx.closeLatestModal();
  }

  public reset(): void {
    this.ngx.resetModalData('natRuleModal');
    this.submitted = false;
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100), NameValidator])],
      description: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(500)])],
      enabled: [true],
      translationType: ['', Validators.required],
      direction: ['', Validators.required],
      biDirectional: [true],
      originalSourceAddressType: [],
      originalSource: [],
      translatedSource: [],
      originalDestination: [],
      translatedDestination: [],
      originalService: [],
      translatedService: [],
    });
  }
}
