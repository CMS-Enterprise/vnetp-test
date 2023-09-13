import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from './table.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxPaginationModule } from 'ngx-pagination';

import { TooltipModule } from '../tooltip/tooltip.module';
import { AdvancedSearchModule } from '../advanced-search/advanced-search-modal.module';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { SharedModule } from '../shared.module';
import { UsedObjectsParentsModalComponent } from '../used-objects-parents-modal/used-objects-parents-modal.component';

@NgModule({
  imports: [SharedModule, CommonModule, FontAwesomeModule, NgxPaginationModule, TooltipModule, AdvancedSearchModule],
  declarations: [TableComponent],
  exports: [TableComponent],
  providers: [SearchBarComponent, UsedObjectsParentsModalComponent],
})
export class TableModule {}
