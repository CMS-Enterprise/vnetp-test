import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VrfComponent } from './vrf.component';
import { RouterModule, Routes } from '@angular/router';
import { VrfModalComponent } from './vrf-modal/vrf-modal.component';
import { VrfRejectionReasonDialogComponent } from './rejection-reason-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TableModule } from 'src/app/common/table/table.module';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { ImportExportModule } from 'src/app/common/import-export/import-export.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';

const routes: Routes = [
  {
    path: '',
    component: VrfComponent,
  },
];

@NgModule({
  declarations: [VrfComponent, VrfModalComponent, VrfRejectionReasonDialogComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FontAwesomeModule,
    TableModule,
    IconButtonModule,
    ImportExportModule,
    NgxSmartModalModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    NgSelectModule,
    YesNoModalModule,
  ],
  exports: [VrfComponent, VrfModalComponent],
})
export class VrfModule {}
