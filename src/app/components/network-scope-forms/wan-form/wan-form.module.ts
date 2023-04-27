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
import { SharedModule } from 'src/app/common/shared.module';
import { TableModule } from 'src/app/common/table/table.module';
import { TabsModule } from 'src/app/common/tabs/tabs.module';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { WanFormModalComponent } from './wan-form-modal/wan-form-modal.component';
import { ExternalRouteModalComponent } from './wan-form-modal/external-route-modal/external-route-modal.component';

const routes: Routes = [
  {
    path: '',
    component: WanFormComponent,
  },
];
@NgModule({
  declarations: [WanFormComponent, WanFormModalComponent, ExternalRouteModalComponent],
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
    SharedModule,
    TableModule,
    TabsModule,
    TooltipModule,
  ],
})
export class WanFormModule {}
