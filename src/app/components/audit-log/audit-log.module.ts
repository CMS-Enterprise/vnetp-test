import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/common/shared.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { TableModule } from 'src/app/common/table/table.module';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { RouterModule, Routes } from '@angular/router';
import { TabsModule } from '../../common/tabs/tabs.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { AuditLogViewModalComponent } from './audit-log-view-modal/audit-log-view-modal.component';
import { AuditLogComponent } from './audit-log.component';

const routes: Routes = [
  {
    path: '',
    component: AuditLogComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    IconButtonModule,
    NgxSmartModalModule,
    NgSelectModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedModule,
    TableModule,
    TooltipModule,
    TabsModule,
  ],
  declarations: [AuditLogComponent, AuditLogViewModalComponent],
})
export class AuditLogModule {}
