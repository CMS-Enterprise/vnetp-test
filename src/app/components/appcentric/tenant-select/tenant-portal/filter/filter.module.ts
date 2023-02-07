import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FilterComponent } from './filter.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { ImportExportModule } from 'src/app/common/import-export/import-export.module';
import { TableModule } from 'src/app/common/table/table.module';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { FilterModalComponent } from './filter-modal/filter-modal.component';
import { FilterEntryModalComponent } from './filter-entry-modal/filter-entry-modal.component';
import { FilterEntryEditModalComponent } from './filter-entry-modal/filter-entry-edit-modal/filter-entry-edit-modal.component';

const routes: Routes = [
  {
    path: '',
    component: FilterComponent,
  },
];

@NgModule({
  declarations: [FilterComponent, FilterModalComponent, FilterEntryModalComponent, FilterEntryEditModalComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FontAwesomeModule,
    TableModule,
    IconButtonModule,
    ImportExportModule,
    NgxSmartModalModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    NgSelectModule,
    YesNoModalModule,
  ],
})
export class FilterModule {}
