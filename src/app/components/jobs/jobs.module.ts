import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobsComponent } from './jobs.component';
import { SharedModule } from 'src/app/common/shared.module';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

const routes: Routes = [
  {
    path: '',
    component: JobsComponent,
  },
];

@NgModule({
  imports: [CommonModule, NgxPaginationModule, SharedModule, RouterModule.forChild(routes)],
  declarations: [JobsComponent],
})
export class JobsModule {}
