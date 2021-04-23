import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubnetsVlansComponent } from './subnets-vlans.component';
import { VlanModalComponent } from './vlan-modal/vlan-modal.component';
import { SubnetModalComponent } from './subnet-modal/subnet-modal.component';
import { SharedModule } from 'src/app/common/shared.module';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { TabsModule } from 'src/app/common/tabs/tabs.module';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { NgSelectModule } from '@ng-select/ng-select';

const routes: Routes = [
  {
    path: '',
    component: SubnetsVlansComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    IconButtonModule,
    NgxPaginationModule,
    NgSelectModule,
    NgxSmartModalModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedModule,
    TabsModule,
    TooltipModule,
  ],
  declarations: [SubnetsVlansComponent, SubnetModalComponent, VlanModalComponent],
})
export class SubnetsVlansModule {}
