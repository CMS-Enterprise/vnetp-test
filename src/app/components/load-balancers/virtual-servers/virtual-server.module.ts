import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/common/shared.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { TableModule } from 'src/app/common/table/table.module';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { VirtualServerListComponent } from './virtual-server-list/virtual-server-list.component';
import { VirtualServerModalComponent } from './virtual-server-modal/virtual-server-modal.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: VirtualServerListComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    IconButtonModule,
    NgxSmartModalModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedModule,
    TableModule,
    TooltipModule,
  ],
  declarations: [VirtualServerListComponent, VirtualServerModalComponent],
})
export class VirtualServerModule {}
