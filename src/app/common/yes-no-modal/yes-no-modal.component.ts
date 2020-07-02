import { Component, Input } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup } from '@angular/forms';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';

@Component({
  selector: 'app-yes-no-modal',
  templateUrl: './yes-no-modal.component.html',
})
export class YesNoModalComponent {
  @Input() allowEmptyTier = false;

  form: FormGroup;
  submitted: boolean;
  modalBody = 'Title';
  modalTitle = 'Body';
  allowEmptyTierRadio = false;

  constructor(private ngx: NgxSmartModalService) {}

  public yes(): void {
    const yesNoModalDto = {
      modalYes: true,
    } as YesNoModalDto;

    if (this.allowEmptyTier) {
      yesNoModalDto.allowTierChecked = this.allowEmptyTierRadio;
    }

    this.ngx.resetModalData('yesNoModal');
    this.ngx.setModalData(Object.assign({}, yesNoModalDto), 'yesNoModal');
    this.ngx.close('yesNoModal');
  }

  public no(): void {
    this.ngx.resetModalData('yesNoModal');
    this.ngx.close('yesNoModal');
  }

  public getData(): void {
    const modalConfig = this.ngx.getModalData('yesNoModal') as YesNoModalDto;

    this.modalTitle = modalConfig.modalTitle;
    this.modalBody = modalConfig.modalBody;
    this.ngx.resetModalData('yesNoModal');
  }
}
