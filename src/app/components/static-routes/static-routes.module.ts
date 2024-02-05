import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaticRoutesComponent } from './static-routes.component';
import { StaticRouteModalComponent } from './static-route-modal/static-route-modal.component';
import { StaticRouteDetailComponent } from './static-route-detail/static-route-detail.component';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { TableModule } from '../../common/table/table.module';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { StandardComponentModule } from 'src/app/common/standard-component/standard-component.module';

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
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    IconButtonModule,
    NgxPaginationModule,
    NgxSmartModalModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TableModule,
    YesNoModalModule,
    StandardComponentModule,
  ],
  declarations: [StaticRoutesComponent, StaticRouteModalComponent, StaticRouteDetailComponent],
  exports: [StaticRoutesComponent, StaticRouteModalComponent, StaticRouteDetailComponent],
})
export class StaticRoutesModule {}
