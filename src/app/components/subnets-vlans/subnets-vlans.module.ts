import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubnetsVlansComponent } from './subnets-vlans.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { SubnetModalComponent } from './subnet-modal/subnet-modal.component';
import { VlanModalComponent } from './vlan-modal/vlan-modal.component';
import { ApplicationPipesModule } from 'src/app/pipes/application-pipes.module';
import { TooltipModule } from '../../common/tooltip/tooltip.module';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { ImportExportModule } from 'src/app/common/import-export/import-export.module';
import { TableModule } from 'src/app/common/table/table.module';
import { TabsModule } from 'src/app/common/tabs/tabs.module';
import { TierSelectModule } from 'src/app/common/tier-select/tier-select.module';
import { AciRuntimeModule } from '../aci-runtime/aci-runtime.module';

const routes: Routes = [
  {
    path: '',
    component: SubnetsVlansComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FontAwesomeModule,
    TooltipModule,
    NgSelectModule,
    FormsModule,
    NgxSmartModalModule,
    ReactiveFormsModule,
    ApplicationPipesModule,
    YesNoModalModule,
    IconButtonModule,
    ImportExportModule,
    TableModule,
    TabsModule,
    TierSelectModule,
    AciRuntimeModule,
  ],
  declarations: [SubnetsVlansComponent, SubnetModalComponent, VlanModalComponent],
  exports: [SubnetsVlansComponent, SubnetModalComponent, VlanModalComponent],
})
export class SubnetsVlansModule {}
