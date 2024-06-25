import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeRequestModalComponent } from './change-request-modal.component';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  imports: [ReactiveFormsModule, NgxSmartModalModule, FormsModule, CommonModule, YesNoModalModule, FontAwesomeModule],
  declarations: [ChangeRequestModalComponent],
  exports: [ChangeRequestModalComponent],
})
export class ChangeRequestModalModule {}
