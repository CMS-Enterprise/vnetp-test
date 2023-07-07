import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TableModule } from 'src/app/common/table/table.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { RouterModule, Routes } from '@angular/router';
import { AuditLogComponent } from './audit-log.component';
import { AuditLogViewModalComponent } from './audit-log-view-modal/audit-log-view-modal.component';

const routes: Routes = [
  {
    path: '',
    component: AuditLogComponent,
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), TableModule, FontAwesomeModule, NgxSmartModalModule],
  declarations: [AuditLogComponent, AuditLogViewModalComponent],
  exports: [AuditLogComponent, AuditLogViewModalComponent],
})
export class AuditLogModule {}
