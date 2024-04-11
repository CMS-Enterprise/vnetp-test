import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { YesNoModalComponent } from './yes-no-modal.component';

@NgModule({
  declarations: [YesNoModalComponent],
  imports: [CommonModule, NgxSmartModalModule, FormsModule],
  exports: [YesNoModalComponent],
})
export class YesNoModalModule {}
