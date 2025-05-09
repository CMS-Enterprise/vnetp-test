import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { L3OutManagementComponent } from './l3-out-management.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

const routes: Routes = [
  {
    path: ':id',
    component: L3OutManagementComponent,
  },
];

@NgModule({
  declarations: [L3OutManagementComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    FontAwesomeModule,
    MatCheckboxModule,
    MatDialogModule,
    MatExpansionModule,
    MatButtonModule,
    MatTableModule,
    ReactiveFormsModule,
  ],
  exports: [L3OutManagementComponent],
})
export class L3OutManagementModule {}
