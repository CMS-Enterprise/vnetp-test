import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TooltipComponent } from 'src/app/common/tooltip/tooltip.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import { NgxSmartModalComponent } from 'ngx-smart-modal';
import { NgSelectModule } from '@ng-select/ng-select';
import { SubnetsVlansComponent } from './subnets-vlans.component';
import { VlanModalComponent } from './vlan-modal/vlan-modal.component';
import { SubnetModalComponent } from './subnet-modal/subnet-modal.component';
import { ResolvePipe } from 'src/app/pipes/resolve.pipe';
import { TierSelectComponent } from 'src/app/common/tier-select/tier-select.component';

const routes: Routes = [
  {
    path: '',
    component: SubnetsVlansComponent,
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
    SubnetsVlansComponent,
    SubnetModalComponent,
    VlanModalComponent,
    ResolvePipe,
    NgxSmartModalComponent,
    TooltipComponent,
    TierSelectComponent,
    ImportExportComponent,
    YesNoModalComponent,
  ],
})
export class SubnetsVlansModule {}
