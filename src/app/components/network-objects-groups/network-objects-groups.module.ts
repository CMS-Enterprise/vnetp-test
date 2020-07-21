import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NetworkObjectsGroupsComponent } from './network-objects-groups.component';
import { NetworkObjectGroupModalComponent } from './network-object-group-modal/network-object-group-modal.component';
import { NetworkObjectModalComponent } from './network-object-modal/network-object-modal.component';
import { SharedModule } from 'src/app/common/shared.module';

const routes: Routes = [
  {
    path: '',
    component: NetworkObjectsGroupsComponent,
  },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [NetworkObjectsGroupsComponent, NetworkObjectGroupModalComponent, NetworkObjectModalComponent],
})
export class NetworkObjectsGroupsModule {}
