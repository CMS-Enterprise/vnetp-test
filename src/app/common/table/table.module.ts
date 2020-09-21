import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from './table.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [CommonModule, FontAwesomeModule, NgxPaginationModule],
  declarations: [TableComponent],
  exports: [TableComponent],
})
export class TableModule {}
