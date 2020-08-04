import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreviewModalComponent } from './preview-modal.component';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { TableModule } from '../table/table.module';

@NgModule({
  imports: [CommonModule, NgxSmartModalModule, TableModule],
  declarations: [PreviewModalComponent],
  exports: [PreviewModalComponent],
})
export class PreviewModalModule {}
