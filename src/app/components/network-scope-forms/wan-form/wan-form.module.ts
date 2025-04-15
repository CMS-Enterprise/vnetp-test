import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WanFormComponent } from './wan-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { PreviewModalModule } from 'src/app/common/preview-modal/preview-modal.module';
import { TableModule } from 'src/app/common/table/table.module';
import { TabsModule } from 'src/app/common/tabs/tabs.module';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { WanFormModalComponent } from './wan-form-modal/wan-form-modal.component';
import { YesNoModalModule } from '../../../common/yes-no-modal/yes-no-modal.module';
import { WanFormDetailComponent } from './wan-form-detail/wan-form-detail.component';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatToolbar } from '@angular/material/toolbar';
import { MatTooltip } from '@angular/material/tooltip';
import { WanFormSubnetsComponent } from './wan-form-subnets/wan-form-subnets.component';
import { WanFormSubnetsModalComponent } from './wan-form-subnets/wan-form-subnets-modal/wan-form-subnets-modal.component';
import { ExternalRouteComponent } from './external-route/external-route.component';
import { ExternalRouteModalComponent } from './external-route/external-route-modal/external-route-modal.component';

const routes: Routes = [
  {
    path: '',
    component: WanFormComponent,
  },
  {
    path: ':id/wan-form-subnets',
    component: WanFormSubnetsComponent,
  },
  {
    path: ':id/external-route',
    component: ExternalRouteComponent,
  },
];
@NgModule({
  declarations: [
    WanFormComponent,
    WanFormModalComponent,
    WanFormDetailComponent,
    WanFormSubnetsComponent,
    WanFormSubnetsModalComponent,
    ExternalRouteComponent,
    ExternalRouteModalComponent,
  ],
  imports: [
    CommonModule,
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    IconButtonModule,
    NgxPaginationModule,
    NgxSmartModalModule,
    NgSelectModule,
    PreviewModalModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TableModule,
    TabsModule,
    TooltipModule,
    IconButtonModule,
    FontAwesomeModule,
    TableModule,
    YesNoModalModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatTableModule,
    MatToolbar,
    MatTooltip,
  ],
  exports: [WanFormDetailComponent],
})
export class WanFormModule {}
