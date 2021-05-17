import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServiceObjectsGroupsComponent } from './service-objects-groups.component';
import { ServiceObjectGroupModalComponent } from './service-object-group-modal/service-object-group-modal.component';
import { ServiceObjectModalComponent } from './service-object-modal/service-object-modal.component';
import { SharedModule } from 'src/app/common/shared.module';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { TabsModule } from 'src/app/common/tabs/tabs.module';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { ToastrModule } from 'ngx-toastr';

const routes: Routes = [
  {
    path: '',
    component: ServiceObjectsGroupsComponent,
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
    TabsModule,
    ToastrModule,
    TooltipModule,
  ],
  declarations: [ServiceObjectsGroupsComponent, ServiceObjectGroupModalComponent, ServiceObjectModalComponent],
})
export class ServiceObjectsGroupsModule {}
