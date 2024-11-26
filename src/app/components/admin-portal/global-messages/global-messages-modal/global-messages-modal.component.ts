import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Message, UserDto, V3GlobalMessagesService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { AuthService } from 'src/app/services/auth.service';

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
  public user: UserDto;
  currentUserSubscription: Subscription;
  availableTenants;

  constructor(
    private messageService: V3GlobalMessagesService,
    private formBuilder: UntypedFormBuilder,
    private ngx: NgxSmartModalService,
    private auth: AuthService,
  ) {}
  ngOnInit(): void {
    if (this.auth.currentUser) {
      this.currentUserSubscription = this.auth.currentUser.subscribe(user => {
        this.user = user;
        this.auth.getTenants(this.user.token).subscribe(data => {
          this.availableTenants = data;
        });
      });
    }

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
      messageType: ['', Validators.required],
      description: ['', Validators.compose([Validators.maxLength(100), Validators.required])],
      tenant: [''],
    });
  }

  private createMessage(message: Message): void {
    this.messageService.createOneMessage({ message }).subscribe(() => {
      this.closeModal();
    });
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { description, messageType, tenant } = this.form.value;
    const message = {
      messageType,
      description,
      tenantName: tenant,
    } as any;
    if (this.modalMode === ModalMode.Create) {
      this.createMessage(message);
    }
  }
}
