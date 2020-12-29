import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { NgModule } from '@angular/core';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { SharedModule } from 'src/app/common/shared.module';
import { TableModule } from 'src/app/common/table/table.module';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { VlanListComponent } from './vlan-list/vlan-list.component';
import { VlanModalComponent } from './vlan-modal/vlan-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    IconButtonModule,
    NgxSmartModalModule,
    ReactiveFormsModule,
    SharedModule,
    TableModule,
    TooltipModule,
  ],
  declarations: [VlanListComponent, VlanModalComponent],
  exports: [VlanListComponent],
})
export class VlanModule {}
