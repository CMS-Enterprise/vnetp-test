import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { LoadBalancerPolicy, LoadBalancerPolicyTypeEnum, V1LoadBalancerPoliciesService } from 'client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';
import { PolicyModalDto } from './policy-modal.dto';
import { Subscription } from 'rxjs';
import ValidatorUtil from 'src/app/utils/ValidatorUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-policy-modal',
  templateUrl: './policy-modal.component.html',
})
export class PolicyModalComponent implements OnInit, OnDestroy {
  public form: UntypedFormGroup;
  public submitted: boolean;
  public PolicyType = LoadBalancerPolicyTypeEnum;

  private policyId: string;
  private modalMode: ModalMode;
  private tierId: string;
  private typeChanges: Subscription;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: UntypedFormBuilder,
    private policyService: V1LoadBalancerPoliciesService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.typeChanges]);
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('policyModal');
    this.submitted = false;
    SubscriptionUtil.unsubscribe([this.typeChanges]);
    this.buildForm();
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const policy = this.getPolicyForSave();
    if (!policy) {
      return;
    }

    if (this.modalMode === ModalMode.Create) {
      this.createPolicy(policy);
    } else {
      this.updatePolicy(policy);
    }
  }

  public getData(): void {
    const dto: PolicyModalDto = Object.assign({}, this.ngx.getModalData('policyModal')) as any;
    const { policy, tierId } = dto;
    this.tierId = tierId;
    this.modalMode = policy ? ModalMode.Edit : ModalMode.Create;

    if (this.modalMode === ModalMode.Edit) {
      const { apmContent, asmContent, name, type, id } = policy;
      this.policyId = id;

      this.form.controls.name.disable();
      this.form.controls.type.disable();

      this.form.controls.apmContent.setValue(apmContent);
      this.form.controls.asmContent.setValue(asmContent);
      this.form.controls.name.setValue(name);
      this.form.controls.type.setValue(type);
    } else {
      this.form.controls.name.enable();
      this.form.controls.type.enable();
    }

    this.typeChanges = this.subscribeToTypeChanges();
    this.ngx.resetModalData('policyModal');
  }

  public importPolicyContent({ target }: { target: HTMLInputElement }): void {
    const [file] = Array.from(target.files);
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result.toString();
      const type = this.form.get('type').value as LoadBalancerPolicyTypeEnum;
      const field: keyof LoadBalancerPolicy = type === LoadBalancerPolicyTypeEnum.Asm ? 'asmContent' : 'apmContent';
      this.form.get(field).setValue(result);
    };
    reader.readAsText(file);
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      type: ['', Validators.required],
      apmContent: ['', ValidatorUtil.optionallyRequired(() => this.form.get('type').value === LoadBalancerPolicyTypeEnum.Apm)],
      asmContent: ['', ValidatorUtil.optionallyRequired(() => this.form.get('type').value === LoadBalancerPolicyTypeEnum.Asm)],
    });
  }

  private createPolicy(loadBalancerPolicy: LoadBalancerPolicy): void {
    this.policyService.createOneLoadBalancerPolicy({ loadBalancerPolicy }).subscribe(
      () => this.closeModal(),
      () => {},
    );
  }

  private updatePolicy(loadBalancerPolicy: LoadBalancerPolicy): void {
    delete loadBalancerPolicy.name;
    delete loadBalancerPolicy.tierId;
    delete loadBalancerPolicy.type;
    this.policyService
      .updateOneLoadBalancerPolicy({
        id: this.policyId,
        loadBalancerPolicy,
      })
      .subscribe(
        () => this.closeModal(),
        () => {},
      );
  }

  private getPolicyForSave(): LoadBalancerPolicy {
    const { name, apmContent, asmContent } = this.form.value;
    const { type } = this.form.getRawValue();
    if (type === LoadBalancerPolicyTypeEnum.Apm) {
      return {
        apmContent,
        name,
        type,
        asmContent: null,
        tierId: this.tierId,
      };
    }

    if (type === LoadBalancerPolicyTypeEnum.Asm) {
      return {
        asmContent,
        name,
        type,
        apmContent: null,
        tierId: this.tierId,
      };
    }

    return null;
  }

  private subscribeToTypeChanges(): Subscription {
    const apmContent = this.form.get('apmContent');
    const asmContent = this.form.get('asmContent');

    const types = new Set([LoadBalancerPolicyTypeEnum.Apm, LoadBalancerPolicyTypeEnum.Asm]);

    return this.form.get('type').valueChanges.subscribe((type: LoadBalancerPolicyTypeEnum) => {
      if (!types.has(type)) {
        return;
      }

      apmContent.setValue(null);
      asmContent.setValue(null);

      apmContent.updateValueAndValidity();
      asmContent.updateValueAndValidity();
    });
  }
}
