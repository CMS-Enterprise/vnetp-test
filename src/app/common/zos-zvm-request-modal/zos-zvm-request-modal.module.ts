import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZosZvmRequestModalComponent } from './zos-zvm-request-modal.component';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [ZosZvmRequestModalComponent],
  imports: [CommonModule, NgxSmartModalModule, FormsModule, ReactiveFormsModule, FontAwesomeModule],
  exports: [ZosZvmRequestModalComponent],
})
export class ZosZvmRequestModalModule {}
