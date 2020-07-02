import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LoadBalancersComponent } from './load-balancers.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSave, faEdit } from '@fortawesome/free-regular-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { HealthMonitorModalComponent } from './health-monitor-modal/health-monitor-modal.component';
import { IRuleModalComponent } from './irule-modal/irule-modal.component';
import { LoadBalancerVlanModalComponent } from './lb-vlan-modal/lb-vlan-modal.component';
import { LoadBalancerRouteModalComponent } from './lb-route-modal/lb-route-modal.component';
import { LoadBalancerSelfIpModalComponent } from './lb-self-ip-modal/lb-self-ip-modal.component';
import { NodeModalComponent } from './node-modal/node-modal.component';
import { PolicyModalComponent } from './policy-modal/policy-modal.component';
import { PoolModalComponent } from './pool-modal/pool-modal.component';
import { ProfileModalComponent } from './profile-modal/profile-modal.component';
import { VirtualServerModalComponent } from './virtual-server-modal/virtual-server-modal.component';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import { ResolvePipe } from 'src/app/pipes/resolve.pipe';
import { TooltipComponent } from 'src/app/common/tooltip/tooltip.component';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TierSelectComponent } from 'src/app/common/tier-select/tier-select.component';

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
    ReactiveFormsModule,
    NgSelectModule,
    NgxPaginationModule,
    NgxSmartModalModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    LoadBalancersComponent,
    HealthMonitorModalComponent,
    IRuleModalComponent,
    LoadBalancerRouteModalComponent,
    LoadBalancerSelfIpModalComponent,
    LoadBalancerVlanModalComponent,
    NodeModalComponent,
    PolicyModalComponent,
    PoolModalComponent,
    ProfileModalComponent,
    VirtualServerModalComponent,
    ImportExportComponent,
    ResolvePipe,
    TooltipComponent,
    TierSelectComponent,
    YesNoModalComponent,
  ],
})
export class LoadBalancersModule {}
