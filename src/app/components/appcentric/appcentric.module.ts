import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppcentricComponent } from './appcentric.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TooltipModule } from '../../common/tooltip/tooltip.module';
import { D3PieChartModule } from '../../common/d3-pie-chart/d3-pie-chart.module';
import { AppcentricNavbarComponent } from './appcentric-navbar/appcentric-navbar.component';
import { AppcentricBreadcrumbsComponent } from './appcentric-breadcrumbs/appcentric-breadcrumbs.component';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { AppcentricDashboardComponent } from './appcentric-dashboard/appcentric-dashboard.component';
import { TenantSelectComponent } from './tenant-select/tenant-select.component';
import { TenantPortalComponent } from './tenant-select/tenant-portal/tenant-portal.component';
import { TabsModule } from 'src/app/common/tabs/tabs.module';
import { TenantPortalModule } from './tenant-select/tenant-portal/tenant-portal.module';
import { TenantSelectModule } from './tenant-select/tenant-select.module';

const routes: Routes = [
  {
    path: '',
    component: AppcentricComponent,
    children: [
      {
        path: 'dashboard',
        component: AppcentricDashboardComponent,
        canActivate: [AuthGuard],
        data: { title: 'Automation - Dashboard' },
        loadChildren: () => import('./appcentric-dashboard/appcentric-dashboard.module').then(m => m.AppcentricDashboardModule),
      },
      {
        path: 'tenant-select',
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Tenant Select', title: 'Tenant Select' },
        loadChildren: () => import('./tenant-select/tenant-select.module').then(m => m.TenantSelectModule),
      },
    ],
  },
];

@NgModule({
  declarations: [AppcentricComponent, AppcentricNavbarComponent, AppcentricBreadcrumbsComponent, AppcentricDashboardComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FontAwesomeModule,
    TooltipModule,
    D3PieChartModule,
    NgxSmartModalModule,
    TenantSelectModule,
  ],
})
export class AppcentricModule {}
