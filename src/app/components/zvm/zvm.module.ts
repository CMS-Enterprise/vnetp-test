import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TooltipComponent } from 'src/app/common/tooltip/tooltip.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { NgxSmartModalComponent } from 'ngx-smart-modal';
import { ZvmComponent } from './zvm.component';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ZosZvmRequestModalComponent } from 'src/app/common/zos-zvm-request-modal/zos-zvm-request-modal.component';

const routes: Routes = [
  {
    path: '',
    component: ZvmComponent,
  },
];

@NgModule({
  imports: [CommonModule, NgxPaginationModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, RouterModule.forChild(routes)],
  declarations: [ZvmComponent, ZosZvmRequestModalComponent, ImportExportComponent, NgxSmartModalComponent, YesNoModalComponent],
})
export class ZvmModule {}
