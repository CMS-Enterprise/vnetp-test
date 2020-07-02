import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NetworkObjectsGroupsComponent } from './network-objects-groups.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { faPencilAlt, faPlus, faUndo, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NetworkObjectGroupModalComponent } from './network-object-group-modal/network-object-group-modal.component';
import { NetworkObjectModalComponent } from './network-object-modal/network-object-modal.component';
import { TooltipComponent } from 'src/app/common/tooltip/tooltip.component';
import { TierSelectComponent } from '../tier-select/tier-select.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import { NgxSmartModalComponent } from 'ngx-smart-modal';
import { NgSelectModule } from '@ng-select/ng-select';

const routes: Routes = [
  {
    path: '',
    component: NetworkObjectsGroupsComponent,
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
    NetworkObjectsGroupsComponent,
    NetworkObjectGroupModalComponent,
    NetworkObjectModalComponent,
    NgxSmartModalComponent,
    TooltipComponent,
    TierSelectComponent,
    ImportExportComponent,
    YesNoModalComponent,
  ],
})
export class NetworkObjectsGroupsModule {}
