import { CommonModule, DatePipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VmListComponent } from './components/vm-list/vm-list.component';
import { TableModule } from 'src/app/common/table/table.module';
import { ViewFieldModule } from 'src/app/common/value-card/view-field.module';
import { VmViewComponent } from './components/vm-view/vm-view.component';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { VmDiscoveryModalComponent } from './components/vm-discovery-modal/vm-discovery-modal.component';
import { FormsModule } from '@angular/forms';
import { SelectVCenterComponent } from './components/vm-discovery-modal/select-vcenter/select-vcenter.component';
import { SelectVirtualMachinesComponent } from './components/vm-discovery-modal/select-virtual-machines/select-virtual-machines.component';

const routes: Routes = [
  {
    path: '',
    component: VmListComponent,
  },
  {
    path: ':id',
    component: VmViewComponent,
    data: { breadcrumb: 'Virtual Machine Detail' },
  },
];

@NgModule({
  imports: [FormsModule, ViewFieldModule, CommonModule, FontAwesomeModule, RouterModule.forChild(routes), TableModule, NgxSmartModalModule],
  declarations: [VmListComponent, VmViewComponent, VmDiscoveryModalComponent, SelectVCenterComponent, SelectVirtualMachinesComponent],
  providers: [DatePipe],
})
export class VirtualMachinesModule {}
