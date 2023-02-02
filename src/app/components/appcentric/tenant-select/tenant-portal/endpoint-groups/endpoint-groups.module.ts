import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EndpointGroupsComponent } from './endpoint-groups.component';
import { RouterModule, Routes } from '@angular/router';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { ImportExportModule } from 'src/app/common/import-export/import-export.module';
import { TableModule } from 'src/app/common/table/table.module';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { EndpointGroupsModalComponent } from './endpoint-groups-modal/endpoint-groups-modal.component';
import { ConsumedContractsComponent } from './endpoint-groups-modal/consumed-contracts/consumed-contracts.component';
import { ProvidedContractsComponent } from './endpoint-groups-modal/provided-contracts/provided-contracts.component';
import { TabsModule } from 'src/app/common/tabs/tabs.module';

const routes: Routes = [
  {
    path: '',
    component: EndpointGroupsComponent,
  },
];

@NgModule({
  declarations: [EndpointGroupsComponent, EndpointGroupsModalComponent, ConsumedContractsComponent, ProvidedContractsComponent],
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
    TabsModule,
  ],
})
export class EndpointGroupsModule {}
