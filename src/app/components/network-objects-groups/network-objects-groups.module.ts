import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NetworkObjectsGroupsComponent } from './network-objects-groups.component';
import { CommonModule } from '@angular/common';
import { NetworkObjectModalComponent } from './network-object-modal/network-object-modal.component';
import { NetworkObjectGroupModalComponent } from './network-object-group-modal/network-object-group-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgSelectModule } from '@ng-select/ng-select';
import { UnusedObjectsModalComponent } from './unused-objects-modal/unused-objects-modal.component';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { IconButtonModule } from '../../common/icon-button/icon-button.module';
import { TooltipModule } from '../../common/tooltip/tooltip.module';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { ImportExportModule } from 'src/app/common/import-export/import-export.module';
import { TableModule } from 'src/app/common/table/table.module';
import { TabsModule } from 'src/app/common/tabs/tabs.module';
import { TierSelectModule } from 'src/app/common/tier-select/tier-select.module';
import { UsedObjectsParentsModalComponent } from '../../common/used-objects-parents-modal/used-objects-parents-modal.component';
import { SharedModule } from 'src/app/common/shared.module';
import { UsedObjectsParentsModalModule } from 'src/app/common/used-objects-parents-modal/used-objects-parents-modal.module';

const routes: Routes = [
  {
    path: '',
    component: NetworkObjectsGroupsComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxSmartModalModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    FontAwesomeModule,
    IconButtonModule,
    NgSelectModule,
    YesNoModalModule,
    ImportExportModule,
    TableModule,
    TabsModule,
    TierSelectModule,
    UsedObjectsParentsModalModule,
  ],
  declarations: [NetworkObjectsGroupsComponent, NetworkObjectGroupModalComponent, NetworkObjectModalComponent, UnusedObjectsModalComponent],
})
export class NetworkObjectsGroupsModule {}
