import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubnetsVlansComponent } from './subnets-vlans.component';
import { VlanModalComponent } from './vlan-modal/vlan-modal.component';
import { SubnetModalComponent } from './subnet-modal/subnet-modal.component';
import { SharedModule } from 'src/app/common/shared.module';

const routes: Routes = [
  {
    path: '',
    component: SubnetsVlansComponent,
  },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [SubnetsVlansComponent, SubnetModalComponent, VlanModalComponent],
})
export class SubnetsVlansModule {}
