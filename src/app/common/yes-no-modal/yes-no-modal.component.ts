import { Component, Input } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { UntypedFormGroup } from '@angular/forms';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';

@Component({
  selector: 'app-yes-no-modal',
  templateUrl: './yes-no-modal.component.html',
  standalone: false,
})
export class YesNoModalComponent {
  @Input() allowEmptyTier = false;

  public allowEmptyTierRadio = false;
  public cancelText = 'No';
  public confirmButtonType: 'primary' | 'danger' | 'success' = 'primary';
  public confirmText = 'Yes';
  public form: UntypedFormGroup;
  public modalBody = 'Title';
  public modalTitle = 'Body';
  public submitted: boolean;

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
    this.cancelText = modalConfig.cancelText;
    this.confirmButtonType = modalConfig.confirmButtonType;
    this.confirmText = modalConfig.confirmText;
    this.modalBody = modalConfig.modalBody;
    this.modalTitle = modalConfig.modalTitle;

    this.ngx.resetModalData('yesNoModal');
  }
}
