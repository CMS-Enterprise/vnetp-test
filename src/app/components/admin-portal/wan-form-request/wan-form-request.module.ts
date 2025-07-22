import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WanFormRequestComponent } from './wan-form-request.component';
import { TableModule } from '../../../common/table/table.module';
import { WanFormModule } from '../../wan-form/wan-form.module';

@NgModule({
  declarations: [WanFormRequestComponent],
  imports: [CommonModule, WanFormModule, TableModule],
  exports: [WanFormRequestComponent],
})
export class WanFormRequestModule {}
