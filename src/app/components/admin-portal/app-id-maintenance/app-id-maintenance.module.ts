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
  ],
  exports: [AppIdMaintenanceComponent],
})
export class AppIdMaintenanceModule {}
