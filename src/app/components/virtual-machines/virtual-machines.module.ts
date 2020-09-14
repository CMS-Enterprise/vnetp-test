import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VmListComponent } from './components/vm-list/vm-list.component';
import { TableModule } from 'src/app/common/table/table.module';

const routes: Routes = [
  {
    path: '',
    component: VmListComponent,
  },
];

@NgModule({
  imports: [CommonModule, FontAwesomeModule, RouterModule.forChild(routes), TableModule],
  declarations: [VmListComponent],
})
export class VirtualMachinesModule {}
