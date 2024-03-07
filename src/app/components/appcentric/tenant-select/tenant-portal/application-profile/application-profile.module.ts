import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationProfileComponent } from './application-profile.component';
import { RouterModule, Routes } from '@angular/router';
import { ApplicationProfileModalComponent } from './application-profile-modal/application-profile-modal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TableModule } from 'src/app/common/table/table.module';
import { ImportExportModule } from 'src/app/common/import-export/import-export.module';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { EndpointGroupModalComponent } from './application-profile-modal/endpoint-group-modal/endpoint-group-modal.component';
import { ProvidedContractComponent } from './application-profile-modal/endpoint-group-modal/provided-contract/provided-contract.component';
import { ConsumedContractComponent } from './application-profile-modal/endpoint-group-modal/consumed-contract/consumed-contract.component';
import { TabsModule } from 'src/app/common/tabs/tabs.module';
import { StandardComponentModule } from 'src/app/common/standard-component/standard-component.module';

const routes: Routes = [
  {
    path: '',
    component: ApplicationProfileComponent,
  },
];

@NgModule({
  declarations: [
    ApplicationProfileComponent,
    ApplicationProfileModalComponent,
    EndpointGroupModalComponent,
    ConsumedContractComponent,
    ProvidedContractComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FontAwesomeModule,
    TableModule,
    ImportExportModule,
    YesNoModalModule,
    IconButtonModule,
    NgxSmartModalModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    NgSelectModule,
    TabsModule,
    StandardComponentModule,
  ],
  exports: [ApplicationProfileComponent, ApplicationProfileModalComponent],
})
export class ApplicationProfileModule {}
