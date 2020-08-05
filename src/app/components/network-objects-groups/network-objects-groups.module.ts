import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NetworkObjectsGroupsComponent } from './network-objects-groups.component';
import { NetworkObjectGroupModalComponent } from './network-object-group-modal/network-object-group-modal.component';
import { NetworkObjectModalComponent } from './network-object-modal/network-object-modal.component';
import { SharedModule } from 'src/app/common/shared.module';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { NgxPaginationModule } from 'ngx-pagination';

const routes: Routes = [
  {
    path: '',
    component: NetworkObjectsGroupsComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    IconButtonModule,
    NgxPaginationModule,
    NgxSmartModalModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedModule,
  ],
  declarations: [NetworkObjectsGroupsComponent, NetworkObjectGroupModalComponent, NetworkObjectModalComponent],
})
export class NetworkObjectsGroupsModule {}
