import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TooltipComponent } from 'src/app/common/tooltip/tooltip.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { NgxSmartModalComponent } from 'ngx-smart-modal';
import { ZosComponent } from './zos.component';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ZosZvmRequestModalComponent } from 'src/app/common/zos-zvm-request-modal/zos-zvm-request-modal.component';
import { SharedModule } from 'src/app/common/shared.module';

const routes: Routes = [
  {
    path: '',
    component: ZosComponent,
  },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [ZosComponent],
})
export class ZosModule {}
