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
import { TooltipModule } from './tooltip/tooltip.module';

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
    TooltipModule,
  ],
  declarations: [ImportExportComponent, ResolvePipe, TierSelectComponent, YesNoModalComponent, ZosZvmRequestModalComponent],
  exports: [ImportExportComponent, ResolvePipe, TierSelectComponent, TooltipComponent, YesNoModalComponent, ZosZvmRequestModalComponent],
})
export class SharedModule {}
