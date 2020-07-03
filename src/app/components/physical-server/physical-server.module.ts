import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PhysicalServerComponent } from './physical-server.component';
import { PhysicalServerModalComponent } from './physical-server-modal/physical-server-modal.component';
import { PhysicalServerDetailComponent } from './physical-server-detail/physical-server-detail.component';
import { SharedModule } from 'src/app/common/shared.module';
import { AuthGuard } from 'src/app/guards/auth.guard';

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
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [PhysicalServerComponent, PhysicalServerModalComponent, PhysicalServerDetailComponent],
})
export class PhysicalServerModule {}
