import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HealthMonitorModalComponent } from './health-monitor-modal/health-monitor-modal.component';
import { HealthMonitorListComponent } from './health-monitor-list/health-monitor-list.component';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { TableModule } from 'src/app/common/table/table.module';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { RouterModule, Routes } from '@angular/router';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { ImportExportModule } from 'src/app/common/import-export/import-export.module';
import { StandardComponentModule } from 'src/app/common/standard-component/standard-component.module';

const routes: Routes = [
  {
    path: '',
    component: HealthMonitorListComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    IconButtonModule,
    NgxSmartModalModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TableModule,
    TooltipModule,
    YesNoModalModule,
    ImportExportModule,
    StandardComponentModule,
  ],
  declarations: [HealthMonitorListComponent, HealthMonitorModalComponent],
})
export class HealthMonitorModule {}
