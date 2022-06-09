import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FirewallRulesComponent } from './firewall-rules.component';
import { SharedModule } from 'src/app/common/shared.module';
import { FirewallRulesDetailComponent } from './firewall-rules-detail/firewall-rules-detail.component';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { FirewallRuleModalComponent } from './firewall-rule-modal/firewall-rule-modal.component';
import { PreviewModalModule } from 'src/app/common/preview-modal/preview-modal.module';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { CommonModule } from '@angular/common';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxPaginationModule } from 'ngx-pagination';
import { TabsModule } from 'src/app/common/tabs/tabs.module';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { TableModule } from '../../common/table/table.module';

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
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    IconButtonModule,
    NgxPaginationModule,
    NgxSmartModalModule,
    NgSelectModule,
    PreviewModalModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedModule,
    TableModule,
    TabsModule,
    TooltipModule,
  ],
  declarations: [FirewallRulesComponent, FirewallRulesDetailComponent, FirewallRuleModalComponent],
})
export class FirewallRulesModule {}
