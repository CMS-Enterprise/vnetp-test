import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VmwareComponent } from './vmware.component';
import { NetworkAdapterModalComponent } from './network-adapter-modal/network-adapter-modal.component';
import { VirtualDiskModalComponent } from './virtual-disk-modal/virtual-disk-modal.component';
import { VirtualMachineModalComponent } from './virtual-machine-modal/virtual-machine-modal.component';
import { VmwareDetailComponent } from './vmware-detail/vmware-detail.component';
import { SharedModule } from 'src/app/common/shared.module';
import { AuthGuard } from 'src/app/guards/auth.guard';

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
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [
    VmwareComponent,
    NetworkAdapterModalComponent,
    VirtualDiskModalComponent,
    VirtualMachineModalComponent,
    VmwareDetailComponent,
  ],
})
export class VmwareModule {}
