import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PhysicalServerComponent } from './physical-server.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { faPencilAlt, faPlus, faUndo, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TooltipComponent } from 'src/app/common/tooltip/tooltip.component';
import { TierSelectComponent } from '../tier-select/tier-select.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import { NgxSmartModalComponent } from 'ngx-smart-modal';
import { NgSelectModule } from '@ng-select/ng-select';
import { PhysicalServerModalComponent } from './physical-server-modal/physical-server-modal.component';
import { PhysicalServerDetailComponent } from './physical-server-detail/physical-server-detail.component';

const routes: Routes = [
  {
    path: '',
    component: PhysicalServerComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    NgxPaginationModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    PhysicalServerComponent,
    PhysicalServerModalComponent,
    PhysicalServerDetailComponent,
    NgxSmartModalComponent,
    TooltipComponent,
    TierSelectComponent,
    ImportExportComponent,
    YesNoModalComponent,
  ],
})
export class PhysicalServerModule {}
