import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TierSelectComponent } from './tier-select.component';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [TierSelectComponent],
  imports: [CommonModule, NgxSmartModalModule, NgSelectModule, FormsModule],
  exports: [TierSelectComponent],
})
export class TierSelectModule {}
