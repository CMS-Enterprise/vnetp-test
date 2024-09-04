import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { ImportExportModule } from 'src/app/common/import-export/import-export.module';
import { TableModule } from 'src/app/common/table/table.module';
import { TabsModule } from 'src/app/common/tabs/tabs.module';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { AciRuntimeModule } from 'src/app/components/aci-runtime/aci-runtime.module';
import { ConsumedContractComponent } from '../endpoint-group/endpoint-group-modal/consumed-contract/consumed-contract.component';
import { ProvidedContractComponent } from '../endpoint-group/endpoint-group-modal/provided-contract/provided-contract.component';
import { EndpointSecurityGroupModalComponent } from './endpoint-security-group-modal/endpoint-security-group-modal.component';
import { EndpointSecurityGroupComponent } from './endpoint-security-group.component';

const routes: Routes = [
  {
    path: '',
    component: EndpointSecurityGroupComponent,
  },
];

@NgModule({
  declarations: [EndpointSecurityGroupComponent, EndpointSecurityGroupModalComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FontAwesomeModule,
    IconButtonModule,
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
  exports: [EndpointSecurityGroupComponent],
})
export class EndpointSecurityGroupModule {}
