import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FirewallRulesComponent } from './firewall-rules.component';
import { FilterPipe } from 'src/app/pipes/filter.pipe';
import { SharedModule } from 'src/app/common/shared.module';
import { FirewallRulesDetailComponent } from './firewall-rules-detail/firewall-rules-detail.component';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { IntraVrfRulesComponent } from './intra-vrf-rules/intra-vrf-rules.component';
import { FirewallRuleModalComponent } from './firewall-rule-modal/firewall-rule-modal.component';
import { ContractModalComponent } from './contract-modal/contract-modal.component';
import { PreviewModalModule } from 'src/app/common/preview-modal/preview-modal.module';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';

const routes: Routes = [
  {
    path: '',
    component: FirewallRulesComponent,
  },
  {
    path: 'edit/:id',
    component: FirewallRulesDetailComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Firewall Rule Group' },
  },
];

@NgModule({
  imports: [IconButtonModule, PreviewModalModule, SharedModule, RouterModule.forChild(routes)],
  declarations: [
    ContractModalComponent,
    FirewallRulesComponent,
    FirewallRulesDetailComponent,
    IntraVrfRulesComponent,
    FirewallRulesDetailComponent,
    FirewallRuleModalComponent,
    FilterPipe,
  ],
})
export class FirewallRulesModule {}
