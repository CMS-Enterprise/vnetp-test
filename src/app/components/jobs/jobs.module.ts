import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobsComponent } from './jobs.component';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

const routes: Routes = [
  {
    path: '',
    component: JobsComponent,
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), FontAwesomeModule],
  declarations: [JobsComponent],
  exports: [JobsComponent],
})
export class JobsModule {}
