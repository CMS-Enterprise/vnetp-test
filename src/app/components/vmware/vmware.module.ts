import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TooltipComponent } from 'src/app/common/tooltip/tooltip.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import { NgxSmartModalComponent } from 'ngx-smart-modal';
import { NgSelectModule } from '@ng-select/ng-select';
import { TierSelectComponent } from 'src/app/common/tier-select/tier-select.component';
import { VmwareComponent } from './vmware.component';
import { NetworkAdapterModalComponent } from './network-adapter-modal/network-adapter-modal.component';
import { VirtualDiskModalComponent } from './virtual-disk-modal/virtual-disk-modal.component';
import { VirtualMachineModalComponent } from './virtual-machine-modal/virtual-machine-modal.component';
import { VmwareDetailComponent } from './vmware-detail/vmware-detail.component';

const routes: Routes = [
  {
    path: '',
    component: VmwareComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    NgxPaginationModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    VmwareComponent,
    NetworkAdapterModalComponent,
    VirtualDiskModalComponent,
    VirtualMachineModalComponent,
    VmwareDetailComponent,
    NgxSmartModalComponent,
    TooltipComponent,
    TierSelectComponent,
    ImportExportComponent,
    YesNoModalComponent,
  ],
})
export class VmwareModule {}
