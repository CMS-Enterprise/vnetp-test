import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IRuleModalHelpText } from 'src/app/helptext/help-text-networking';
import { LoadBalancerIrule, V1LoadBalancerIrulesService } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';
import { IRuleModalDto } from './irule-modal.dto';

@Component({
  selector: 'app-irule-modal',
  templateUrl: './irule-modal.component.html',
})
export class IRuleModalComponent implements OnInit {
  public form: FormGroup;
  public submitted: boolean;

  private iRuleId: string;
  private modalMode: ModalMode;
  private tierId: string;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private iRuleService: V1LoadBalancerIrulesService,
    public helpText: IRuleModalHelpText,
  ) {}

  ngOnInit() {
    this.buildForm();
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('iRuleModal');
    this.submitted = false;
    this.buildForm();
  }

  public getData(): void {
    const dto: IRuleModalDto = Object.assign({}, this.ngx.getModalData('iRuleModal'));
    const { iRule, tierId } = dto;
    this.tierId = tierId;
    this.modalMode = iRule ? ModalMode.Edit : ModalMode.Create;

    if (this.modalMode === ModalMode.Edit) {
      this.iRuleId = iRule.id;
    } else {
      this.form.controls.name.enable();
    }

    if (iRule) {
      this.form.controls.name.setValue(iRule.name);
      this.form.controls.name.disable();
      this.form.controls.content.setValue(iRule.content);
    }
    this.ngx.resetModalData('iRuleModal');
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { content, name } = this.form.value;
    const iRule: LoadBalancerIrule = {
      tierId: this.tierId,
      content,
      name,
    };

    if (this.modalMode === ModalMode.Create) {
      this.createIRule(iRule);
    } else {
      this.updateIRule(iRule);
    }
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      content: ['', Validators.required],
    });
  }

  private createIRule(iRule: LoadBalancerIrule): void {
    this.iRuleService
      .v1LoadBalancerIrulesPost({
        loadBalancerIrule: iRule,
      })
      .subscribe(
        () => {
          this.closeModal();
        },
        () => {},
      );
  }

  private updateIRule(iRule: LoadBalancerIrule): void {
    iRule.tierId = undefined;
    this.iRuleService
      .v1LoadBalancerIrulesIdPut({
        id: this.iRuleId,
        loadBalancerIrule: iRule,
      })
      .subscribe(
        () => {
          this.closeModal();
        },
        () => {},
      );
  }
}
