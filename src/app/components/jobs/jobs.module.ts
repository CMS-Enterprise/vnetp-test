import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { JobsComponent } from './jobs.component';
import { NgxPaginationModule } from 'ngx-pagination';

const routes: Routes = [
  {
    path: '',
    component: JobsComponent,
  },
];

@NgModule({
  imports: [CommonModule, NgxPaginationModule, RouterModule.forChild(routes)],
  declarations: [JobsComponent],
})
export class JobsModule {}
