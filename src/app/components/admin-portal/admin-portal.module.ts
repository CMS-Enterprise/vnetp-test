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
import { TenantSelectComponent } from '../appcentric/tenant-select/tenant-select.component';
import { AppIdMaintenanceModule } from './app-id-maintenance/app-id-maintenance.module';
import { AppIdMaintenanceComponent } from './app-id-maintenance/app-id-maintenance.component';
import { EnvironmentManagementComponent } from './environment-management/environment-management.component';
import { WorkflowsManagementComponent } from './workflows-management/workflows-management.component';
import { WorkflowsManagementModule } from './workflows-management/workflows-management.module';

const routes: Routes = [
  {
    path: '',
    component: AdminPortalComponent,
    // Apply default data to the parent route
    children: [
      {
        path: 'dashboard',
        component: AdminPortalDashboardComponent,
        canActivate: [AdminAuthGuard],
        data: {
          breadcrumb: 'Dashboard',
          title: 'Dashboard',
        },
        loadChildren: () => import('./admin-portal-dashboard/admin-portal-dashboard.module').then(m => m.AdminPortalDashboardModule),
      },
      {
        path: 'global-bgp-asn',
        canActivate: [AdminAuthGuard],
        data: {
          breadcrumb: 'Global BGP ASN',
          title: 'Global BGP ASN',
        },
        loadChildren: () => import('./global-bgp-asn/global-bgp-asn.module').then(m => m.GlobalBgpAsnModule),
      },
      {
        path: 'global-messages',
        component: GlobalMessagesComponent,
        canActivate: [AdminAuthGuard],
        data: {
          breadcrumb: 'Global Messages',
          title: 'Global Messages',
        },
        loadChildren: () => import('./global-messages/global-messages.module').then(m => m.GlobalMessagesModule),
      },
      {
        path: 'tenant-v2',
        component: TenantSelectComponent,
        canActivate: [AdminAuthGuard],
        data: {
          breadcrumb: 'Tenant V2',
          title: 'Tenant V2',
        },
        loadChildren: () => import('../appcentric/tenant-select/tenant-select.module').then(m => m.TenantSelectModule),
      },
      {
        path: 'tenant-infrastructure/create',
        canActivate: [AdminAuthGuard],
        data: {
          breadcrumb: 'Tenant Infrastructure',
          title: 'Tenant Infrastructure',
        },
        loadChildren: () => import('./tenant-infrastructure/tenant-infrastructure.module').then(m => m.TenantInfrastructureModule),
      },
      {
        path: 'tenant-infrastructure/edit/:id',
        canActivate: [AdminAuthGuard],
        data: {
          breadcrumb: 'Tenant Infrastructure',
          title: 'Tenant Infrastructure',
        },
        loadChildren: () => import('./tenant-infrastructure/tenant-infrastructure.module').then(m => m.TenantInfrastructureModule),
      },
      {
        path: 'route-control-request',
        canActivate: [AdminAuthGuard],
        data: { breadcrumb: 'Route Control Requests', title: 'Route Control Requests' },
        loadChildren: () => import('./route-control-request/route-control-request.module').then(m => m.RouteControlRequestModule),
      },
      {
        path: 'app-id-maintenance',
        component: AppIdMaintenanceComponent,
        canActivate: [AdminAuthGuard],
        data: {
          breadcrumb: 'App ID Maintenance',
          title: 'App ID Maintenance',
        },
        loadChildren: () => import('./app-id-maintenance/app-id-maintenance.module').then(m => m.AppIdMaintenanceModule),
      },
      {
        path: 'environment-management',
        component: EnvironmentManagementComponent,
        canActivate: [AdminAuthGuard],
        data: {
          breadcrumb: 'Environment Management',
          title: 'Environment Management',
        },
        loadChildren: () => import('./environment-management/environment-management.module').then(m => m.EnvironmentManagementModule),
      },
      {
        path: 'workflows',
        component: WorkflowsManagementComponent,
        canActivate: [AdminAuthGuard],
        data: {
          breadcrumb: 'Workflows',
          title: 'Workflows',
        },
        loadChildren: () => import('./workflows-management/workflows-management.module').then(m => m.WorkflowsManagementModule),
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
    AppIdMaintenanceModule,
    WorkflowsManagementModule,
  ],
})
export class AdminPortalModule {}
