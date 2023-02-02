import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { L3OutsComponent } from './l3-outs.component';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { ImportExportModule } from 'src/app/common/import-export/import-export.module';
import { TableModule } from 'src/app/common/table/table.module';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { L3OutsModalComponent } from './l3-outs-modal/l3-outs-modal.component';

const routes: Routes = [
  {
    path: '',
    component: L3OutsComponent,
  },
];

@NgModule({
  declarations: [L3OutsComponent, L3OutsModalComponent],
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
  exports: [L3OutsComponent, L3OutsModalComponent],
})
export class L3OutsModule {}
