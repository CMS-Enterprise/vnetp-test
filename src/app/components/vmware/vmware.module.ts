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
import { TabsModule } from 'src/app/common/tabs/tabs.module';
import { PriorityGroupListComponent } from './priority-group/priority-group-list/priority-group-list.component';
import { PriorityGroupModalComponent } from './priority-group/priority-group-modal/priority-group-modal.component';
import { ViewFieldModule } from 'src/app/common/view-field/view-field.module';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';

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
    TabsModule,
    ViewFieldModule,
    YesNoModalModule,
  ],
  declarations: [
    NetworkAdapterModalComponent,
    PriorityGroupListComponent,
    PriorityGroupModalComponent,
    VirtualDiskModalComponent,
    VirtualMachineModalComponent,
    VmwareComponent,
    VmwareDetailComponent,
  ],
  exports: [
    NetworkAdapterModalComponent,
    PriorityGroupListComponent,
    PriorityGroupModalComponent,
    VirtualDiskModalComponent,
    VirtualMachineModalComponent,
    VmwareComponent,
    VmwareDetailComponent,
  ],
})
export class VmwareModule {}
