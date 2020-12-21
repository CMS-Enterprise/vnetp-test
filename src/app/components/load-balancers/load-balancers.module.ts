import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoadBalancersComponent } from './load-balancers.component';
import { LoadBalancerSelfIpModalComponent } from './lb-self-ip-modal/lb-self-ip-modal.component';
import { NodeModalComponent } from './node-modal/node-modal.component';
import { PolicyModalComponent } from './policy-modal/policy-modal.component';
import { PoolModalComponent } from './pool-modal/pool-modal.component';
import { ProfileModalComponent } from './profile-modal/profile-modal.component';
import { VirtualServerModalComponent } from './virtual-server-modal/virtual-server-modal.component';
import { SharedModule } from 'src/app/common/shared.module';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { TabsModule } from 'src/app/common/tabs/tabs.module';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { HealthMonitorModule } from './health-monitors/health-monitor.module';
import { VlanModule } from './vlans/vlan.module';
import { LoadBalancerRouteModalComponent } from './lb-route-modal/lb-route-modal.component';

const routes: Routes = [
  {
    path: '',
    component: LoadBalancersComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    IconButtonModule,
    NgxPaginationModule,
    NgxSmartModalModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedModule,
    TabsModule,
    TooltipModule,
    // IRuleModule,
    HealthMonitorModule,
    VlanModule,
  ],
  declarations: [
    LoadBalancersComponent,
    LoadBalancerSelfIpModalComponent,
    NodeModalComponent,
    PolicyModalComponent,
    PoolModalComponent,
    ProfileModalComponent,
    VirtualServerModalComponent,
    LoadBalancerRouteModalComponent,
  ],
})
export class LoadBalancersModule {}
