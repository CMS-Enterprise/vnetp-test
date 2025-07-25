import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxSmartModalModule } from 'ngx-smart-modal';

import { EnvironmentManagementComponent } from './environment-management.component';
import { EnvironmentModalComponent } from './environment-modal/environment-modal.component';
import { TableModule } from 'src/app/common/table/table.module';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';

@NgModule({
  declarations: [EnvironmentManagementComponent, EnvironmentModalComponent],
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule, NgxSmartModalModule, TableModule, IconButtonModule],
  exports: [EnvironmentManagementComponent, EnvironmentModalComponent],
})
export class EnvironmentManagementModule {}
