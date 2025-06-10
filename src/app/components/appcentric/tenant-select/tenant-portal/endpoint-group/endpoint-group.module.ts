import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EndpointGroupComponent } from './endpoint-group.component';
import { RouterModule, Routes } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconButtonModule } from '../../../../../common/icon-button/icon-button.module';
import { ImportExportModule } from '../../../../../common/import-export/import-export.module';
import { TableModule } from '../../../../../common/table/table.module';
import { EndpointGroupModalComponent } from './endpoint-group-modal/endpoint-group-modal.component';
import { ProvidedContractComponent } from './endpoint-group-modal/provided-contract/provided-contract.component';
import { ConsumedContractComponent } from './endpoint-group-modal/consumed-contract/consumed-contract.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TabsModule } from '../../../../../common/tabs/tabs.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { AciRuntimeModule } from '../../../../aci-runtime/aci-runtime.module';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';

const routes: Routes = [
  {
    path: '',
    component: EndpointGroupComponent,
  },
];

@NgModule({
  declarations: [EndpointGroupComponent, EndpointGroupModalComponent, ProvidedContractComponent, ConsumedContractComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FontAwesomeModule,
    ImportExportModule,
    TableModule,
    NgSelectModule,
    ImportExportModule,
    IconButtonModule,
    FormsModule,
    ReactiveFormsModule,
    TabsModule,
    NgxSmartModalModule,
    AciRuntimeModule,
    YesNoModalModule,
  ],
  exports: [EndpointGroupComponent],
})
export class EndpointGroupModule {}
