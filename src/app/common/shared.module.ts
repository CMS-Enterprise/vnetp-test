import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImportExportComponent } from './import-export/import-export.component';
import { TierSelectComponent } from './tier-select/tier-select.component';
import { TooltipComponent } from './tooltip/tooltip.component';
import { ZosZvmRequestModalComponent } from './zos-zvm-request-modal/zos-zvm-request-modal.component';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ResolvePipe } from '../pipes/resolve.pipe';
import { PreviewModalComponent } from './preview-modal/preview-modal.component';
import { TableModule } from './table/table.module';

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
    TableModule,
  ],
  declarations: [
    ImportExportComponent,
    ResolvePipe,
    TierSelectComponent,
    TooltipComponent,
    YesNoModalComponent,
    PreviewModalComponent,
    ZosZvmRequestModalComponent,
  ],
  exports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSmartModalModule,
    NgxPaginationModule,
    ImportExportComponent,
    ResolvePipe,
    TierSelectComponent,
    TableModule,
    TooltipComponent,
    YesNoModalComponent,
    PreviewModalComponent,
    ZosZvmRequestModalComponent,
  ],
})
export class SharedModule {}
