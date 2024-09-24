import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Message, V3GlobalMessagesService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';

@Component({
  selector: 'app-global-messages-modal',
  templateUrl: './global-messages-modal.component.html',
  styleUrls: ['./global-messages-modal.component.scss'],
})
export class GlobalMessagesModalComponent implements OnInit {
  form: UntypedFormGroup;
  submitted: boolean;
  modalMode: ModalMode;
  messageId: string;

  constructor(
    private messageService: V3GlobalMessagesService,
    private formBuilder: UntypedFormBuilder,
    private ngx: NgxSmartModalService,
  ) {}
  ngOnInit(): void {
    this.buildForm();
  }

  getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('globalMessagesModal') as any);
    this.modalMode = dto.ModalMode;
    this.form.controls.description.enable();
    this.ngx.resetModalData('globalMessagesModal');
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('globalMessagesModal');
    this.reset();
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('globalMessagesModal');
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      description: ['', Validators.compose([Validators.maxLength(100), Validators.required])],
    });
  }

  private createMessage(message: Message): void {
    this.messageService.createMessageMessage({ message }).subscribe(() => {
      this.closeModal();
    });
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { description } = this.form.value;
    const message = {
      description,
    } as Message;
    if (this.modalMode === ModalMode.Create) {
      this.createMessage(message);
    }
  }
}
