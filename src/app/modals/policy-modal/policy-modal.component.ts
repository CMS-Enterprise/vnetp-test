import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadBalancerPolicy, V1LoadBalancerPoliciesService } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import { PolicyModalDto } from 'src/app/models/loadbalancer/policy-modal-dto';

@Component({
  selector: 'app-load-balancer-policy-modal',
  templateUrl: './policy-modal.component.html',
})
export class PolicyModalComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;
  TierId: string;
  ModalMode: ModalMode;
  Policy: LoadBalancerPolicy;
  PolicyId: string;

  privateKeyCipher: string;
  publicKey: string;
  typeSubscription: Subscription;

  // TODO: Helptext

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private policyService: V1LoadBalancerPoliciesService,
  ) {}

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const policy = {} as LoadBalancerPolicy;
    policy.name = this.form.controls.name.value;
    policy.type = this.form.controls.type.value;

    if (policy.type === 'APM') {
      policy.apmContent = this.form.controls.apmContent.value;
    } else if (policy.type === 'ASM') {
      policy.asmContent = this.form.controls.asmContent.value;
    }

    if (this.ModalMode === ModalMode.Create) {
      policy.tierId = this.TierId;
      this.policyService
        .v1LoadBalancerPoliciesPost({
          loadBalancerPolicy: policy,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    } else {
      this.policyService
        .v1LoadBalancerPoliciesIdPut({
          id: this.PolicyId,
          loadBalancerPolicy: policy,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    }
  }

  private closeModal() {
    this.ngx.close('loadBalancerPolicyModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('loadBalancerPolicyModal');
    this.reset();
  }

  get f() {
    return this.form.controls;
  }

  importPolicyContent(evt: any) {
    const files = evt.target.files;
    const file = files[0];
    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = () => {
      const result = reader.result.toString();

      if (this.f.type.value === 'ASM') {
        this.f.asmContent.setValue(result);
      } else if (this.f.type.value === 'APM') {
        this.f.apmContent.setValue(result);
      }
    };
  }

  getData() {
    const dto = this.ngx.getModalData(
      'loadBalancerPolicyModal',
    ) as PolicyModalDto;

    if (!dto.ModalMode) {
      throw Error('Modal Mode not Set.');
    } else {
      this.ModalMode = dto.ModalMode;

      if (this.ModalMode === ModalMode.Edit) {
        this.PolicyId = dto.Policy.id;
      }
    }

    this.TierId = dto.TierId;
    const profile = dto.Policy;

    if (profile !== undefined) {
      this.form.controls.type.disable();
      this.form.controls.name.disable();
      this.form.controls.name.setValue(dto.Policy.name);
      this.form.controls.type.setValue(dto.Policy.type);
      this.form.controls.apmContent.setValue(dto.Policy.apmContent);
      this.form.controls.asmContent.setValue(dto.Policy.asmContent);
    }
    this.ngx.resetModalData('loadBalancerPolicyModal');
  }

  private setFormValidators() {
    const apmContent = this.form.controls.apmContent;
    const asmContent = this.form.controls.asmContent;

    this.typeSubscription = this.form.controls.type.valueChanges.subscribe(
      type => {
        switch (type) {
          case 'ASM':
            asmContent.setValidators(Validators.required);
            asmContent.setValue(null);
            apmContent.setValidators(null);
            apmContent.setValue(null);
            break;
          case 'APM':
            apmContent.setValidators(Validators.required);
            apmContent.setValue(null);
            asmContent.setValidators(null);
            asmContent.setValue(null);
            break;
        }
        apmContent.updateValueAndValidity();
        asmContent.updateValueAndValidity();
      },
    );
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      apmContent: [''],
      asmContent: [''],
    });
  }

  private reset() {
    this.submitted = false;
    this.privateKeyCipher = null;
    this.buildForm();
    this.setFormValidators();
  }

  ngOnInit() {
    this.buildForm();
    this.setFormValidators();
  }
}
