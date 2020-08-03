import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServiceObjectsGroupsComponent } from './service-objects-groups.component';
import { ServiceObjectGroupModalComponent } from './service-object-group-modal/service-object-group-modal.component';
import { ServiceObjectModalComponent } from './service-object-modal/service-object-modal.component';
import { SharedModule } from 'src/app/common/shared.module';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';

const routes: Routes = [
  {
    path: '',
    component: ServiceObjectsGroupsComponent,
  },
];

@NgModule({
  imports: [IconButtonModule, SharedModule, RouterModule.forChild(routes)],
  declarations: [ServiceObjectsGroupsComponent, ServiceObjectGroupModalComponent, ServiceObjectModalComponent],
})
export class ServiceObjectsGroupsModule {}
