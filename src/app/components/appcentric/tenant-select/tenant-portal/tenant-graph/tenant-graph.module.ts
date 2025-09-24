import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TenantGraphComponent } from './tenant-graph.component';

const routes: Routes = [
  {
    path: '',
    component: TenantGraphComponent,
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), FontAwesomeModule],
  declarations: [TenantGraphComponent],
  exports: [TenantGraphComponent],
})
export class TenantGraphModule {}
