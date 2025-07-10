import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { PreviewModalModule } from 'src/app/common/preview-modal/preview-modal.module';
import { TableModule } from 'src/app/common/table/table.module';
import { TabsModule } from 'src/app/common/tabs/tabs.module';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { WanFormSubnetsComponent } from './wan-form-subnets/wan-form-subnets.component';
import { WanFormDetailComponent } from './wan-form-detail/wan-form-detail.component';
import { ExternalRouteComponent } from './external-route/external-route.component';
import { MatTabsModule } from '@angular/material/tabs';
import { WanFormSubnetsModalComponent } from './wan-form-subnets/wan-form-subnets-modal/wan-form-subnets-modal.component';
import { ExternalRouteModalComponent } from './external-route/external-route-modal/external-route-modal.component';

@NgModule({
  declarations: [
    WanFormDetailComponent,
    WanFormSubnetsComponent,
    ExternalRouteComponent,
    WanFormSubnetsModalComponent,
    ExternalRouteModalComponent,
  ],
  imports: [
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
  ],
  exports: [
    WanFormDetailComponent,
    WanFormSubnetsComponent,
    ExternalRouteComponent,
    WanFormSubnetsModalComponent,
    ExternalRouteModalComponent,
  ],
})
export class WanFormModule {}
