import { Component, Input } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup } from '@angular/forms';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';

@Component({
  selector: 'app-yes-no-modal',
  templateUrl: './yes-no-modal.component.html',
})
export class YesNoModalComponent {
  form: FormGroup;
  submitted: boolean;
  modalBody = 'Title';
  modalTitle = 'Body';
  allowEmptyTierRadio = false;
  @Input() allowEmptyTier = false;

  constructor(private ngx: NgxSmartModalService) {}

  yes() {
    const yesNoModalDto = {} as YesNoModalDto;
    yesNoModalDto.modalYes = true;

    if (this.allowEmptyTier) {
      yesNoModalDto.allowTierChecked = this.allowEmptyTierRadio;
    }

    this.ngx.resetModalData('yesNoModal');
    this.ngx.setModalData(Object.assign({}, yesNoModalDto), 'yesNoModal');
    this.ngx.close('yesNoModal');
  }

  no() {
    this.ngx.resetModalData('yesNoModal');
    this.ngx.close('yesNoModal');
  }

  getData() {
    const modalConfig = this.ngx.getModalData('yesNoModal') as YesNoModalDto;

    this.modalTitle = modalConfig.modalTitle;
    this.modalBody = modalConfig.modalBody;
    this.ngx.resetModalData('yesNoModal');
  }
}
