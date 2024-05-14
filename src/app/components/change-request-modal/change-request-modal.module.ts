import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeRequestModalComponent } from './change-request-modal.component';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [ReactiveFormsModule, NgxSmartModalModule, FormsModule, CommonModule],
  declarations: [ChangeRequestModalComponent],
  exports: [ChangeRequestModalComponent],
})
export class ChangeRequestModalModule {}
