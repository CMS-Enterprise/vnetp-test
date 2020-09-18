import { CommonModule, DatePipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VmListComponent } from './components/vm-list/vm-list.component';
import { TableModule } from 'src/app/common/table/table.module';
import { ViewFieldModule } from 'src/app/common/value-card/view-field.module';
import { VmViewComponent } from './components/vm-view/vm-view.component';

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
  imports: [ViewFieldModule, CommonModule, FontAwesomeModule, RouterModule.forChild(routes), TableModule],
  declarations: [VmListComponent, VmViewComponent],
  providers: [DatePipe],
})
export class VirtualMachinesModule {}
