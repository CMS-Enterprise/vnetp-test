import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NavbarModule } from 'src/app/common/navbar/navbar.module';
import { AdminPortalComponent } from './admin-portal.component';
import { AdminPortalDashboardComponent } from './admin-portal-dashboard/admin-portal-dashboard.component';
import { AdminAuthGuard } from 'src/app/guards/admin-auth.guard';
import { TableModule } from 'src/app/common/table/table.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { AdminPortalNavbarComponent } from './admin-portal-navbar/admin-portal-navbar.component';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { BreadcrumbsModule } from 'src/app/common/breadcrumbs/breadcrumbs.module';
import { GlobalMessagesComponent } from './global-messages/global-messages.component';
import { FormsModule } from '@angular/forms';
import { FirewallRuleGroupZonesComponent } from './firewall-rule-group-zones/firewall-rule-group-zones.component';
import { FirewallRuleGroupComponent } from './firewall-rule-group/firewall-rule-group.component';

const routes: Routes = [
  {
    path: '',
    component: AdminPortalComponent,
    children: [
      {
        path: 'dashboard',
        component: AdminPortalDashboardComponent,
        canActivate: [AdminAuthGuard],
        loadChildren: () => import('./admin-portal-dashboard/admin-portal-dashboard.module').then(m => m.AdminPortalDashboardModule),
      },
      {
        path: 'global-messages',
        component: GlobalMessagesComponent,
        canActivate: [AdminAuthGuard],
        data: { breadcrumb: 'Global Messages', title: 'Global Messages' },
        loadChildren: () => import('./global-messages/global-messages.module').then(m => m.GlobalMessagesModule),
      },
      {
        path: 'firewall-rule-group-zones',
        component: FirewallRuleGroupZonesComponent,
        canActivate: [AdminAuthGuard],
        data: { breadcrumb: 'FW Rule Group Zones', title: 'FW Rule Group Zones' },
        loadChildren: () =>
          import('./firewall-rule-group-zones/firewall-rule-group-zones.module').then(m => m.FirewallRuleGroupZonesModule),
      },
      {
        path: 'firewall-rule-group',
        component: FirewallRuleGroupComponent,
        canActivate: [AdminAuthGuard],
        data: { breadcrumb: 'FW Rule Group', title: 'FW Rule Group' },
        loadChildren: () => import('./firewall-rule-group/firewall-rule-group.module').then(m => m.FirewallRuleGroupModule),
      },
    ],
  },
];

@NgModule({
  declarations: [AdminPortalNavbarComponent, AdminPortalComponent, AdminPortalDashboardComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NavbarModule,
    TableModule,
    FontAwesomeModule,
    IconButtonModule,
    YesNoModalModule,
    NgxSmartModalModule,
    BreadcrumbsModule,
    FormsModule,
  ],
})
export class AdminPortalModule {}
