import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { D3PieChartComponent } from './d3-pie-chart/d3-pie-chart.component';
import { ImportExportComponent } from './import-export/import-export.component';
import { TierSelectComponent } from './tier-select/tier-select.component';
import { TooltipComponent } from './tooltip/tooltip.component';
import { ZosZvmRequestModalComponent } from './zos-zvm-request-modal/zos-zvm-request-modal.component';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ResolvePipe } from '../pipes/resolve.pipe';

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
  declarations: [
    D3PieChartComponent,
    ImportExportComponent,
    ResolvePipe,
    TierSelectComponent,
    TooltipComponent,
    YesNoModalComponent,
    ZosZvmRequestModalComponent,
  ],
  exports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSmartModalModule,
    NgxPaginationModule,
    D3PieChartComponent,
    ImportExportComponent,
    ResolvePipe,
    TierSelectComponent,
    TooltipComponent,
    YesNoModalComponent,
    ZosZvmRequestModalComponent,
  ],
})
export class SharedModule {}
