import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PhysicalServerComponent } from './physical-server.component';
import { PhysicalServerModalComponent } from './physical-server-modal/physical-server-modal.component';
import { PhysicalServerDetailComponent } from './physical-server-detail/physical-server-detail.component';
import { SharedModule } from 'src/app/common/shared.module';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';

const routes: Routes = [
  {
    path: '',
    component: PhysicalServerComponent,
  },
  {
    path: ':id',
    component: PhysicalServerDetailComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Physical Server Detail' },
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
    SharedModule,
    YesNoModalModule,
  ],
  declarations: [PhysicalServerComponent, PhysicalServerModalComponent, PhysicalServerDetailComponent],
  exports: [PhysicalServerComponent, PhysicalServerModalComponent, PhysicalServerDetailComponent],
})
export class PhysicalServerModule {}
