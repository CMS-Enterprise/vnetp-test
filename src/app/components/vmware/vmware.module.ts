import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VmwareComponent } from './vmware.component';
import { NetworkAdapterModalComponent } from './network-adapter-modal/network-adapter-modal.component';
import { VirtualDiskModalComponent } from './virtual-disk-modal/virtual-disk-modal.component';
import { VirtualMachineModalComponent } from './virtual-machine-modal/virtual-machine-modal.component';
import { VmwareDetailComponent } from './vmware-detail/vmware-detail.component';
import { SharedModule } from 'src/app/common/shared.module';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSmartModalModule } from 'ngx-smart-modal';

const routes: Routes = [
  {
    path: '',
    component: VmwareComponent,
  },
  {
    path: ':id',
    component: VmwareDetailComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'VMWare Detail' },
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
  ],
  declarations: [
    VmwareComponent,
    NetworkAdapterModalComponent,
    VirtualDiskModalComponent,
    VirtualMachineModalComponent,
    VmwareDetailComponent,
  ],
})
export class VmwareModule {}
