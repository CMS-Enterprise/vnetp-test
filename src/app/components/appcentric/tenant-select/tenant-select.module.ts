import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TenantSelectComponent } from './tenant-select.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { TenantPortalComponent } from './tenant-portal/tenant-portal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TenantPortalModule } from './tenant-portal/tenant-portal.module';
import { TableModule } from 'src/app/common/table/table.module';
import { ImportExportModule } from 'src/app/common/import-export/import-export.module';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { TenantSelectModalComponent } from './tenant-select-modal/tenant-select-modal.component';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TypeDeleteModalModule } from 'src/app/common/type-delete-modal/type-delete-modal.module';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';

const routes: Routes = [
  {
    path: '',
    component: TenantSelectComponent,
  },
  {
    path: 'edit/:id',
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Tenant Portal' },
    component: TenantPortalComponent,
  },
];
@NgModule({
  declarations: [TenantSelectComponent, TenantSelectModalComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FontAwesomeModule,
    TenantPortalModule,
    TableModule,
    ImportExportModule,
    IconButtonModule,
    YesNoModalModule,
    NgxSmartModalModule,
    FormsModule,
    ReactiveFormsModule,
    TypeDeleteModalModule,
    TooltipModule,
  ],
  exports: [TenantSelectComponent, TenantSelectModalComponent],
})
export class TenantSelectModule {}
