import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgSelectModule } from '@ng-select/ng-select';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { ImportExportModule } from 'src/app/common/import-export/import-export.module';
import { TableModule } from 'src/app/common/table/table.module';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { ContractAssociationComponent } from './contract-association.component';
import { TabsModule } from '../../../../../common/tabs/tabs.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { AciRuntimeModule } from '../../../../aci-runtime/aci-runtime.module';

@NgModule({
  declarations: [ContractAssociationComponent],
  imports: [
    CommonModule,
    // RouterModule.forChild(routes),
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
  exports: [ContractAssociationComponent],
})
export class ContractAssociationModule {}
