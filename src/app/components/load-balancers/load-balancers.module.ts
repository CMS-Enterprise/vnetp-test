import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoadBalancersComponent } from './load-balancers.component';
import { PolicyModalComponent } from './policy-modal/policy-modal.component';
import { PoolModalComponent } from './pool-modal/pool-modal.component';
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
import { VirtualServerModule } from './virtual-servers/virtual-server.module';
import { IRuleModule } from './irules/irule.module';
import { ProfileModule } from './profiles/profile.module';
import { RouteModule } from './routes/route.module';
import { SelfIpModule } from './self-ips/self-ip.module';
import { NodeModule } from './nodes/node.module';

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
    IRuleModule,
    HealthMonitorModule,
    VlanModule,
    VirtualServerModule,
    ProfileModule,
    RouteModule,
    SelfIpModule,
    NodeModule,
  ],
  declarations: [LoadBalancersComponent, PolicyModalComponent, PoolModalComponent],
})
export class LoadBalancersModule {}
