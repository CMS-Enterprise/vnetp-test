import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/common/shared.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { TableModule } from 'src/app/common/table/table.module';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { SelfIpListComponent } from './self-ip-list/self-ip-list.component';
import { SelfIpModalComponent } from './self-ip-modal/self-ip-modal.component';

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
  declarations: [SelfIpListComponent, SelfIpModalComponent],
  exports: [SelfIpListComponent],
})
export class SelfIpModule {}
