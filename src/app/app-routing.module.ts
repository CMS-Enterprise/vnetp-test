import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from './guards/auth.guard';
const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./components/login/login.module').then(m => m.LoginModule),
  },
  {
    path: 'self-service',
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Managed Network', title: 'Automation - Managed Network' },
    loadChildren: () => import('./components/self-service/self-service.module').then(m => m.SelfServiceModule),
  },
  {
    path: 'subnets-vlans',
    canActivate: [AuthGuard],
    loadChildren: () => import('./components/appcentric/appcentric.module').then(m => m.AppcentricModule),
  },
  {
    path: 'netcentric',
    canActivate: [AuthGuard],
    loadChildren: () => import('./components/netcentric/netcentric.module').then(m => m.NetcentricModule),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: '**',
    canActivate: [AuthGuard],
    loadChildren: () => import('./components/not-found/not-found.module').then(m => m.NotFoundModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
