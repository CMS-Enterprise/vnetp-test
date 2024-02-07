import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServiceObjectsGroupsComponent } from './service-objects-groups.component';
import { ServiceObjectGroupModalComponent } from './service-object-group-modal/service-object-group-modal.component';
import { ServiceObjectModalComponent } from './service-object-modal/service-object-modal.component';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { TabsModule } from 'src/app/common/tabs/tabs.module';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { TableModule } from '../../common/table/table.module';
import { UnusedObjectsModalComponent } from './unused-objects-modal/unused-objects-modal.component';
import { ImportExportModule } from 'src/app/common/import-export/import-export.module';
import { TierSelectModule } from 'src/app/common/tier-select/tier-select.module';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { UsedObjectsParentsModalModule } from 'src/app/common/used-objects-parents-modal/used-objects-parents-modal.module';
import { StandardComponentModule } from 'src/app/common/standard-component/standard-component.module';

const routes: Routes = [
  {
    path: '',
    component: ServiceObjectsGroupsComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    IconButtonModule,
    NgxPaginationModule,
    NgxSmartModalModule,
    NgSelectModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TableModule,
    TabsModule,
    TooltipModule,
    ImportExportModule,
    TierSelectModule,
    YesNoModalModule,
    UsedObjectsParentsModalModule,
    StandardComponentModule,
  ],
  declarations: [ServiceObjectsGroupsComponent, ServiceObjectGroupModalComponent, ServiceObjectModalComponent, UnusedObjectsModalComponent],
  exports: [ServiceObjectsGroupsComponent, ServiceObjectGroupModalComponent, ServiceObjectModalComponent],
})
export class ServiceObjectsGroupsModule {}
