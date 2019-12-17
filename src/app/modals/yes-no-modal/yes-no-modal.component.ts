import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';

@Component({
  selector: 'app-yes-no-modal',
  templateUrl: './yes-no-modal.component.html',
})
export class YesNoModalComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;
  modalBody = 'Title';
  modalTitle = 'Body';

  constructor(private ngx: NgxSmartModalService) {}

  yes() {
    const yesNoModalDto = {} as YesNoModalDto;

    yesNoModalDto.modalYes = true;

    // this.ngx.resetModalData('yesNoModal');
    this.ngx.setModalData(Object.assign({}, yesNoModalDto), 'yesNoModal');
    this.ngx.close('yesNoModal');
  }

  no() {
    this.ngx.resetModalData('yesNoModal');
    this.ngx.close('yesNoModal');
  }

  getData() {
    const modalConfig = this.ngx.getModalData('yesNoModal') as YesNoModalDto;

    console.log(modalConfig);

    this.modalTitle = modalConfig.modalTitle;
    this.modalBody = modalConfig.modalBody;
    this.ngx.resetModalData('yesNoModal');
  }

  ngOnInit() {}
}
