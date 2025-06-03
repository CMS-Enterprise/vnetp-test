import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EndpointConnectivityUtilityComponent } from './endpoint-connectivity-utility.component';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { IconCodePipe } from './icon-code.pipe';

const routes: Routes = [
  {
    path: '',
    component: EndpointConnectivityUtilityComponent,
  },
];

@NgModule({
  declarations: [EndpointConnectivityUtilityComponent, IconCodePipe],
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, ReactiveFormsModule, NgxGraphModule],
  exports: [EndpointConnectivityUtilityComponent],
})
export class EndpointConnectivityUtilityModule {}
