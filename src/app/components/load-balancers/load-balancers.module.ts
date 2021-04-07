import { NgModule } from '@angular/core';
import { LoadBalancersComponent } from './load-balancers.component';
import { SharedModule } from 'src/app/common/shared.module';
import { TabsModule } from 'src/app/common/tabs/tabs.module';
import { CommonModule } from '@angular/common';

import { LoadBalancersRoutingModule } from './load-balancers-routing.module';

@NgModule({
  imports: [CommonModule, LoadBalancersRoutingModule, SharedModule, TabsModule],
  declarations: [LoadBalancersComponent],
})
export class LoadBalancersModule {}
