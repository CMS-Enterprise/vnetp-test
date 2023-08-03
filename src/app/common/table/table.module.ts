import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from './table.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxPaginationModule } from 'ngx-pagination';

import { TooltipModule } from '../tooltip/tooltip.module';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { SearchBarModule } from '../search-bar/search-bar.module';

@NgModule({
  imports: [SearchBarModule, CommonModule, FontAwesomeModule, NgxPaginationModule, TooltipModule],
  declarations: [TableComponent],
  exports: [TableComponent],
  providers: [SearchBarComponent],
})
export class TableModule {}
