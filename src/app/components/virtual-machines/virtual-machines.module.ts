import { CommonModule, DatePipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { RouterModule, Routes } from '@angular/router';
import { SelectVCenterComponent } from './components/vm-discovery-modal/select-vcenter/select-vcenter.component';
import { SelectVirtualMachinesComponent } from './components/vm-discovery-modal/select-virtual-machines/select-virtual-machines.component';
import { TableModule } from 'src/app/common/table/table.module';
import { ViewFieldModule } from 'src/app/common/view-field/view-field.module';
import { VmDiscoveryModalComponent } from './components/vm-discovery-modal/vm-discovery-modal.component';
import { VmListComponent } from './components/vm-list/vm-list.component';
import { VmViewComponent } from './components/vm-view/vm-view.component';
import { TabsModule } from 'src/app/common/tabs/tabs.module';
import { SelectActionComponent } from './components/vm-discovery-modal/select-action/select-action.component';
import { NgSelectModule } from '@ng-select/ng-select';

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
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    NgSelectModule,
    NgxSmartModalModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TableModule,
    TabsModule,
    ViewFieldModule,
  ],
  declarations: [
    SelectActionComponent,
    SelectVCenterComponent,
    SelectVirtualMachinesComponent,
    VmDiscoveryModalComponent,
    VmListComponent,
    VmViewComponent,
  ],
  exports: [
    SelectActionComponent,
    SelectVCenterComponent,
    SelectVirtualMachinesComponent,
    VmDiscoveryModalComponent,
    VmListComponent,
    VmViewComponent,
  ],
  providers: [DatePipe],
})
export class VirtualMachinesModule {}
