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
import { MatIconModule } from '@angular/material/icon';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

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
    MatIconModule,
    FontAwesomeModule,
  ],
  providers: [provideAnimations()],
  exports: [AppIdMaintenanceComponent],
})
export class AppIdMaintenanceModule {}
