import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from './guards/auth.guard';
const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./components/login/login.module').then(m => m.LoginModule),
  },
  {
    path: 'appcentric',
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
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
