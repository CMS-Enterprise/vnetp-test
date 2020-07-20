import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NameValidator } from 'src/app/validators/name-validator';
import { NatRuleGroupModalDto } from '../../models/nat-rule-group-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';

@Component({
  selector: 'app-nat-rule-group-modal',
  templateUrl: './nat-rule-group-modal.component.html',
})
export class NatRuleGroupModalComponent implements OnInit {
  public form: FormGroup;
  public submitted = false;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder) {}

  get f() {
    return this.form.controls;
  }

  public ngOnInit(): void {
    this.initForm();
  }

  public initNatRuleGroup(): void {
    this.initForm();

    const dto = Object.assign({}, this.ngx.getModalData('natRuleGroupModal') as NatRuleGroupModalDto);

    if (dto.modalMode === ModalMode.Edit) {
      const { name, type } = dto.natRuleGroup;

      this.f.name.setValue(name);
      this.f.name.disable();

      this.f.type.setValue(type);
      this.f.type.disable();
    }
  }

  public closeModal(): void {
    this.reset();
    this.ngx.closeLatestModal();
  }

  public reset(): void {
    this.ngx.resetModalData('natRuleGroupModal');
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
      type: [null, Validators.required],
    });
  }
}
