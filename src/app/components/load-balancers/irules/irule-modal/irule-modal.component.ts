import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { IRuleModalHelpText } from 'src/app/helptext/help-text-networking';
import { LoadBalancerIrule, V1LoadBalancerIrulesService } from 'client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';
import { IRuleModalDto } from './irule-modal.dto';

@Component({
  selector: 'app-irule-modal',
  templateUrl: './irule-modal.component.html',
  standalone: false,
})
export class IRuleModalComponent implements OnInit {
  public form: UntypedFormGroup;
  public submitted: boolean;

  private iRuleId: string;
  private modalMode: ModalMode;
  private tierId: string;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: UntypedFormBuilder,
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
    const dto: IRuleModalDto = Object.assign({}, this.ngx.getModalData('iRuleModal')) as any;
    const { iRule, tierId } = dto;
    this.tierId = tierId;
    this.modalMode = iRule ? ModalMode.Edit : ModalMode.Create;

    if (this.modalMode === ModalMode.Edit) {
      const { name, description, content, id } = iRule;
      this.iRuleId = id;

      this.form.controls.name.disable();

      this.form.controls.content.setValue(content);
      this.form.controls.description.setValue(description);
      this.form.controls.name.setValue(name);
    } else {
      this.form.controls.name.enable();
    }
    this.ngx.resetModalData('iRuleModal');
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { content, description, name } = this.form.value;
    const iRule: LoadBalancerIrule = {
      tierId: this.tierId,
      content,
      description,
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
      description: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(100)])],
    });
  }

  private createIRule(loadBalancerIrule: LoadBalancerIrule): void {
    this.iRuleService.createOneLoadBalancerIrule({ loadBalancerIrule }).subscribe(
      () => this.closeModal(),
      () => {},
    );
  }

  private updateIRule(loadBalancerIrule: LoadBalancerIrule): void {
    delete loadBalancerIrule.name;
    delete loadBalancerIrule.tierId;
    this.iRuleService
      .updateOneLoadBalancerIrule({
        id: this.iRuleId,
        loadBalancerIrule,
      })
      .subscribe(
        () => this.closeModal(),
        () => {},
      );
  }
}
