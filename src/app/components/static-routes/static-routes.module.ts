import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaticRoutesComponent } from './static-routes.component';
import { StaticRouteModalComponent } from './static-route-modal/static-route-modal.component';
import { StaticRouteDetailComponent } from './static-route-detail/static-route-detail.component';
import { SharedModule } from 'src/app/common/shared.module';
import { AuthGuard } from 'src/app/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: StaticRoutesComponent,
  },
  {
    path: 'edit/:id',
    component: StaticRouteDetailComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Edit Static Route' },
  },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [StaticRoutesComponent, StaticRouteModalComponent, StaticRouteDetailComponent],
})
export class StaticRoutesModule {}
