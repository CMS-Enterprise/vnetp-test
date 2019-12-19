import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IRuleModalHelpText } from 'src/app/helptext/help-text-networking';
import { LoadBalancerIrule, V1LoadBalancerIrulesService } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';

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
          id: this.Irule.id,
          loadBalancerIrule: irule,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    }

    this.closeModal();
  }

  private closeModal() {
    this.ngx.close('healthMonitorModal');
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
    const irule = Object.assign(
      {},
      this.ngx.getModalData('iruleModal') as LoadBalancerIrule,
    );
    if (irule !== undefined) {
      this.form.controls.name.setValue(irule.name);
      this.form.controls.content.setValue(irule.content);
    }
    this.ngx.resetModalData('iruleModal');
  }

  removeIrule(irule: LoadBalancerIrule) {
    const modalDto = new YesNoModalDto('Remove Irule', '');
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();

    const yesNoModalSubscription = this.ngx
      .getModal('yesNoModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        const data = modal.getData() as YesNoModalDto;
        modal.removeData();
        if (data && data.modalYes) {
          this.iruleService
            .v1LoadBalancerIrulesIdDelete({ id: irule.id })
            .subscribe(() => {
              this.getIrules();
            });
        }
        yesNoModalSubscription.unsubscribe();
      });
  }

  private getIrules() {
    this.iruleService
      .v1LoadBalancerIrulesIdGet({ id: this.Irule.id })
      .subscribe(data => {
        this.Irule = data;
      });
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      content: ['', Validators.required],
    });
  }

  private reset() {
    this.submitted = false;
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }
}
