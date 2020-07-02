import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ServiceObjectsGroupsComponent } from './service-objects-groups.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ServiceObjectGroupModalComponent } from './service-object-group-modal/service-object-group-modal.component';
import { ServiceObjectModalComponent } from './service-object-modal/service-object-modal.component';
import { TooltipComponent } from 'src/app/common/tooltip/tooltip.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import { NgxSmartModalComponent } from 'ngx-smart-modal';
import { NgSelectModule } from '@ng-select/ng-select';
import { TierSelectComponent } from 'src/app/common/tier-select/tier-select.component';

const routes: Routes = [
  {
    path: '',
    component: ServiceObjectsGroupsComponent,
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
    ServiceObjectsGroupsComponent,
    ServiceObjectGroupModalComponent,
    ServiceObjectModalComponent,
    NgxSmartModalComponent,
    TooltipComponent,
    TierSelectComponent,
    ImportExportComponent,
    YesNoModalComponent,
  ],
})
export class ServiceObjectsGroupsModule {}
