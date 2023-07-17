import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { NgModule } from '@angular/core';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { TableModule } from 'src/app/common/table/table.module';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { VlanListComponent } from './vlan-list/vlan-list.component';
import { VlanModalComponent } from './vlan-modal/vlan-modal.component';
import { RouterModule, Routes } from '@angular/router';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { ImportExportModule } from 'src/app/common/import-export/import-export.module';

const routes: Routes = [
  {
    path: '',
    component: VlanListComponent,
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
    TableModule,
    TooltipModule,
    YesNoModalModule,
    ImportExportModule,
  ],
  declarations: [VlanListComponent, VlanModalComponent],
})
export class VlanModule {}
