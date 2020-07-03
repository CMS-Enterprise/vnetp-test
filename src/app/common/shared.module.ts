import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSave } from '@fortawesome/free-regular-svg-icons';
import { faTrash, faUndo, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { D3GraphComponent } from './d3-graph/d3-graph.component';
import { D3PieChartComponent } from './d3-pie-chart/d3-pie-chart.component';
import { DatacenterSelectComponent } from './datacenter-select/datacenter-select.component';
import { ImportExportComponent } from './import-export/import-export.component';
import { NavbarComponent } from './navbar/navbar.component';
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
    BreadcrumbComponent,
    D3GraphComponent,
    D3PieChartComponent,
    DatacenterSelectComponent,
    ImportExportComponent,
    NavbarComponent,
    ResolvePipe,
    TierSelectComponent,
    TooltipComponent,
    YesNoModalComponent,
    ZosZvmRequestModalComponent,
  ],
  exports: [
    BreadcrumbComponent,
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSmartModalModule,
    NgxPaginationModule,
    D3GraphComponent,
    D3PieChartComponent,
    DatacenterSelectComponent,
    ImportExportComponent,
    NavbarComponent,
    ResolvePipe,
    TierSelectComponent,
    TooltipComponent,
    YesNoModalComponent,
    ZosZvmRequestModalComponent,
  ],
})
export class SharedModule {}
