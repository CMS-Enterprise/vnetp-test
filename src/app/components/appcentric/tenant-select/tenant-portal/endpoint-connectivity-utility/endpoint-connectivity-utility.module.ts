import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EndpointConnectivityUtilityComponent } from './endpoint-connectivity-utility.component';

const routes: Routes = [
  {
    path: '',
    component: EndpointConnectivityUtilityComponent,
  },
];

@NgModule({
  declarations: [EndpointConnectivityUtilityComponent],
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule],
  exports: [EndpointConnectivityUtilityComponent],
})
export class EndpointConnectivityUtilityModule {}
