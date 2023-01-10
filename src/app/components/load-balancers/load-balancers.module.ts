import { NgModule } from '@angular/core';
import { LoadBalancersComponent } from './load-balancers.component';
import { TabsModule } from 'src/app/common/tabs/tabs.module';
import { CommonModule } from '@angular/common';

import { LoadBalancersRoutingModule } from './load-balancers-routing.module';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { ImportExportModule } from 'src/app/common/import-export/import-export.module';
import { TierSelectModule } from 'src/app/common/tier-select/tier-select.module';

@NgModule({
  imports: [CommonModule, LoadBalancersRoutingModule, TabsModule, YesNoModalModule, ImportExportModule, TierSelectModule],
  declarations: [LoadBalancersComponent],
  exports: [LoadBalancersComponent],
})
export class LoadBalancersModule {}
