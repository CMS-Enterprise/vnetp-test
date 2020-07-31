import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreviewModalComponent } from './preview-modal.component';
import { TableComponent } from '../table/table.component';
import { NgxSmartModalModule } from 'ngx-smart-modal';

@NgModule({
  imports: [CommonModule, NgxSmartModalModule],
  declarations: [PreviewModalComponent, TableComponent],
  exports: [PreviewModalComponent],
})
export class PreviewModalModule {}
