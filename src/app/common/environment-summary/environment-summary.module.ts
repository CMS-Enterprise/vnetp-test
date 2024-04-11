import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TableModule } from '../table/table.module';
import { RouterModule, Routes } from '@angular/router';
import { EnvironmentSummaryComponent } from './environment-summary.component';

const routes: Routes = [
  {
    path: '',
    component: EnvironmentSummaryComponent,
  },
];
@NgModule({
  declarations: [EnvironmentSummaryComponent],
  imports: [CommonModule, FontAwesomeModule, TableModule, RouterModule.forChild(routes)],
})
export class EnvironmentSummaryModule {}
