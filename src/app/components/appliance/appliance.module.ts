import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplianceComponent } from './appliance.component';
import { ApplianceDetailComponent } from './appliance-detail/appliance-detail.component';
import { ApplianceModalComponent } from './appliance-modal/appliance-modal.component';
import { SharedModule } from 'src/app/common/shared.module';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ViewFieldModule } from 'src/app/common/view-field/view-field.module';

const routes: Routes = [
  {
    path: '',
    component: ApplianceComponent,
  },
  {
    path: ':id',
    component: ApplianceDetailComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Appliance Detail' },
  },
];

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    IconButtonModule,
    NgxSmartModalModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedModule,
    ViewFieldModule,
  ],
  declarations: [ApplianceComponent, ApplianceDetailComponent, ApplianceModalComponent],
})
export class ApplianceModule {}
