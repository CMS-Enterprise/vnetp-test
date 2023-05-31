import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from './table.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from '../shared.module';
import { SearchBarComponent } from '../seach-bar/search-bar.component';
import { TooltipModule } from '../tooltip/tooltip.module';
import { AdvancedSearchModule } from '../advanced-search/advanced-search-modal.module';

@NgModule({
  imports: [SharedModule, CommonModule, FontAwesomeModule, NgxPaginationModule, TooltipModule, AdvancedSearchModule],
  declarations: [TableComponent],
  exports: [TableComponent],
  providers: [SearchBarComponent],
})
export class TableModule {}
