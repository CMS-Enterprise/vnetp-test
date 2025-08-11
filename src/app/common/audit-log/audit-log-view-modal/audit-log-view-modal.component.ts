import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { AuditLog } from '../../../../../client';

@Component({
  selector: 'app-audit-log-view-modal',
  templateUrl: './audit-log-view-modal.component.html',
  standalone: false,
})
export class AuditLogViewModalComponent {
  @ViewChild('changedTemplate') changedTemplate: TemplateRef<any>;
  @Input() auditLog: AuditLog;
  changedProperties: any;

  public changedPropsConfig = {
    columns: [
      {
        name: 'Property',
        property: 'propertyName',
      },
      {
        name: 'Value before',
        property: 'before',
      },
      {
        name: 'Value after',
        property: 'after',
      },
    ],
  };
  public config = {
    description: 'Detailed Audit Log Entry',
    columns: [
      {
        name: 'Object Name',
        property: 'objectName',
      },
      {
        name: 'Action Type',
        property: 'actionType',
      },
      {
        name: 'Object Type',
        property: 'entityType',
      },
      {
        name: 'Changed By',
        property: 'changedBy',
      },
      {
        name: 'Values Changed',
        template: () => this.changedTemplate,
      },
    ],
  };
}
