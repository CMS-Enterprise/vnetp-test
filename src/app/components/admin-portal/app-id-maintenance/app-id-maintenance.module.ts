import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppIdMaintenanceComponent } from './app-id-maintenance.component';
import { RouterModule, Routes } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { YesNoModalModule } from '../../../common/yes-no-modal/yes-no-modal.module';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconButtonModule } from '../../../common/icon-button/icon-button.module';
import { TierManagementModalModule } from './tier-management-modal/tier-management-modal.module';

const routes: Routes = [
  {
    path: '',
    component: AppIdMaintenanceComponent,
  },
];

@NgModule({
  declarations: [AppIdMaintenanceComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    YesNoModalModule,
    MatIconModule,
    MatTooltipModule,
    FontAwesomeModule,
    IconButtonModule,
    TierManagementModalModule,
  ],
  exports: [AppIdMaintenanceComponent],
})
export class AppIdMaintenanceModule {}
