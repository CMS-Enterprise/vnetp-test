import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from './guards/auth.guard';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { ApplicationMode } from './models/other/application-mode-enum';
const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./components/login/login.module').then(m => m.LoginModule),
  },
  {
    path: 'adminportal',
    canActivate: [AdminAuthGuard],
    loadChildren: () => import('./components/admin-portal/admin-portal.module').then(m => m.AdminPortalModule),
    data: { mode: ApplicationMode.ADMINPORTAL },
  },
  {
    path: 'appcentric',
    canActivate: [AuthGuard],
    loadChildren: () => import('./components/appcentric/appcentric.module').then(m => m.AppcentricModule),
    data: { mode: ApplicationMode.APPCENTRIC },
  },
  {
    path: 'netcentric',
    canActivate: [AuthGuard],
    loadChildren: () => import('./components/netcentric/netcentric.module').then(m => m.NetcentricModule),
    data: { mode: ApplicationMode.NETCENTRIC },
  },
  {
    path: 'tenantv2',
    canActivate: [AuthGuard],
    loadChildren: () => import('./components/tenant-v2/tenant-v2.module').then(m => m.TenantV2Module),
    data: { mode: ApplicationMode.TENANTV2 },
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: '**',
    canActivate: [AuthGuard],
    loadChildren: () => import('./components/not-found/not-found.module').then(m => m.NotFoundModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
