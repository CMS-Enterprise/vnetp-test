import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImportExportComponent } from './import-export/import-export.component';
import { TierSelectComponent } from './tier-select/tier-select.component';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ResolvePipe } from '../pipes/resolve.pipe';
import { FilterPipe } from '../pipes/filter.pipe';
import { SearchBarComponent } from './seach-bar/search-bar.component';

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSmartModalModule,
    RouterModule,
    NgSelectModule,
    NgxPaginationModule,
  ],
  declarations: [SearchBarComponent, ImportExportComponent, ResolvePipe, FilterPipe, TierSelectComponent, YesNoModalComponent],
  exports: [SearchBarComponent, ImportExportComponent, ResolvePipe, FilterPipe, TierSelectComponent, YesNoModalComponent],
})
export class SharedModule {}
