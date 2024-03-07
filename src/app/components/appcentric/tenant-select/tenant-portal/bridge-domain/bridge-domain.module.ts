import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BridgeDomainComponent } from './bridge-domain.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TableModule } from 'src/app/common/table/table.module';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { ImportExportModule } from 'src/app/common/import-export/import-export.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { BridgeDomainModalComponent } from './bridge-domain-modal/bridge-domain-modal.component';
import { SubnetsModalComponent } from './subnets-modal/subnets-modal.component';
import { SubnetsEditModalComponent } from './subnets-modal/subnets-edit-modal/subnets-edit-modal.component';
import { StandardComponentModule } from 'src/app/common/standard-component/standard-component.module';

const routes: Routes = [
  {
    path: '',
    component: BridgeDomainComponent,
  },
];

@NgModule({
  declarations: [BridgeDomainComponent, BridgeDomainModalComponent, SubnetsModalComponent, SubnetsEditModalComponent],
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
    StandardComponentModule,
  ],
  exports: [BridgeDomainComponent, BridgeDomainModalComponent],
})
export class BridgeDomainModule {}
