import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { IconButtonModule } from '../../common/icon-button/icon-button.module';
import { PreviewModalModule } from '../../common/preview-modal/preview-modal.module';
import { TableModule } from '../../common/table/table.module';
import { TabsModule } from '../../common/tabs/tabs.module';
import { TooltipModule } from '../../common/tooltip/tooltip.module';
import { YesNoModalModule } from '../../common/yes-no-modal/yes-no-modal.module';
import { ExternalRouteModalComponent } from './external-route/external-route-modal/external-route-modal.component';
import { ExternalRouteComponent } from './external-route/external-route.component';
import { InternalRouteModalComponent } from './internal-route/internal-route-modal/internal-route-modal.component';
import { InternalRouteComponent } from './internal-route/internal-route.component';
import { ExternalVrfRouteDetailComponent } from './external-vrf-route-detail/external-vrf-route-detail.component';
import { RouteConfigComponent } from './route-config/route-config.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: ':vrfId',
    component: RouteConfigComponent,
  },
];

@NgModule({
  declarations: [
    InternalRouteComponent,
    ExternalRouteComponent,
    InternalRouteModalComponent,
    ExternalRouteModalComponent,
    ExternalVrfRouteDetailComponent,
    RouteConfigComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    IconButtonModule,
    NgxPaginationModule,
    NgxSmartModalModule,
    NgSelectModule,
    PreviewModalModule,
    ReactiveFormsModule,
    TableModule,
    TabsModule,
    TooltipModule,
    YesNoModalModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatTableModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTabsModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatExpansionModule,
  ],
  exports: [
    InternalRouteComponent,
    ExternalRouteComponent,
    InternalRouteModalComponent,
    ExternalRouteModalComponent,
    ExternalVrfRouteDetailComponent,
    RouteConfigComponent,
  ],
})
export class RoutingModule { }
