import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from './table.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxPaginationModule } from 'ngx-pagination';

import { TooltipModule } from '../tooltip/tooltip.module';
import { AdvancedSearchModule } from '../advanced-search/advanced-search-modal.module';
import { SearchBarComponent } from '../search-bar/search-bar.component';

import { UsedObjectsParentsModalComponent } from '../used-objects-parents-modal/used-objects-parents-modal.component';
import { SearchBarModule } from '../search-bar/search-bar.module';
import { IconButtonModule } from '../icon-button/icon-button.module';
@NgModule({
  imports: [SearchBarModule, CommonModule, FontAwesomeModule, NgxPaginationModule, TooltipModule, AdvancedSearchModule, IconButtonModule],

  declarations: [TableComponent],
  exports: [TableComponent],
  providers: [SearchBarComponent, UsedObjectsParentsModalComponent],
})
export class TableModule {}
