import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplianceComponent } from './appliance.component';
import { ApplianceDetailComponent } from './appliance-detail/appliance-detail.component';
import { ApplianceModalComponent } from './appliance-modal/appliance-modal.component';
import { SharedModule } from 'src/app/common/shared.module';
import { AuthGuard } from 'src/app/guards/auth.guard';

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
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [ApplianceComponent, ApplianceDetailComponent, ApplianceModalComponent],
})
export class ApplianceModule {}
