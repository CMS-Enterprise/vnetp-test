import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WanFormRequestComponent } from './wan-form-request.component';
import { WanFormModule } from '../../network-scope-forms/wan-form/wan-form.module';
import { TableModule } from '../../../common/table/table.module';

@NgModule({
  declarations: [WanFormRequestComponent],
  imports: [CommonModule, WanFormModule, TableModule],
  exports: [WanFormRequestComponent],
})
export class WanFormRequestModule {}
