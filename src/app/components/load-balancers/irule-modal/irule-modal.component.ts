import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IRuleModalHelpText } from 'src/app/helptext/help-text-networking';
import { LoadBalancerIrule, V1LoadBalancerIrulesService } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { NameValidator } from 'src/app/validators/name-validator';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-irule-modal',
  templateUrl: './irule-modal.component.html',
})
export class IRuleModalComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;
  ModalMode: ModalMode;
  TierId: string;
  Irule: LoadBalancerIrule;
  IruleId: string;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private iruleService: V1LoadBalancerIrulesService,
    public helpText: IRuleModalHelpText,
  ) {}

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const irule = {} as LoadBalancerIrule;
    irule.name = this.form.value.name;
    irule.content = this.form.value.content;

    if (this.ModalMode === ModalMode.Create) {
      irule.tierId = this.TierId;
      this.iruleService
        .v1LoadBalancerIrulesPost({
          loadBalancerIrule: irule,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    } else {
      this.iruleService
        .v1LoadBalancerIrulesIdPut({
          id: this.IruleId,
          loadBalancerIrule: irule,
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
    this.ngx.close('iruleModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('iruleModal');
    this.reset();
  }

  get f() {
    return this.form.controls;
  }

  getData() {
    const dto = Object.assign({}, this.ngx.getModalData('iruleModal'));
    if (dto.TierId) {
      this.TierId = dto.TierId;
    }

    if (!dto.ModalMode) {
      throw Error('Modal Mode not Set.');
    } else {
      this.ModalMode = dto.ModalMode;

      if (this.ModalMode === ModalMode.Edit) {
        this.IruleId = dto.irule.id;
      } else {
        this.form.controls.name.enable();
      }
    }

    if (dto !== undefined && dto.irule) {
      this.form.controls.name.setValue(dto.irule.name);
      this.form.controls.name.disable();
      this.form.controls.content.setValue(dto.irule.content);
    }
    this.ngx.resetModalData('iruleModal');
  }

  removeIrule(irule: LoadBalancerIrule) {
    const modalDto = new YesNoModalDto('Remove Irule', '');
    const onConfirm = () => {
      this.iruleService.v1LoadBalancerIrulesIdDelete({ id: irule.id }).subscribe(() => {
        this.getIrules();
      });
    };
    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  private getIrules() {
    this.iruleService.v1LoadBalancerIrulesIdGet({ id: this.IruleId }).subscribe(data => {
      this.Irule = data;
    });
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100), NameValidator])],
      content: ['', Validators.required],
    });
  }

  public reset() {
    this.submitted = false;
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }
}
