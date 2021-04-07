import { Component, Input } from '@angular/core';
import { ActifioDetailedLogicalGroupDto } from 'api_client';

@Component({
  selector: 'app-logical-group-view-modal',
  templateUrl: './logical-group-view-modal.component.html',
})
export class LogicalGroupViewModalComponent {
  @Input() logicalGroup: ActifioDetailedLogicalGroupDto;

  public config = {
    description: 'List of Virtual Machines within Logical Group',
    columns: [
      {
        name: 'Managed?',
        property: 'isManaged',
      },
      {
        name: 'Name',
        property: 'name',
      },
      {
        name: 'Folder Path',
        property: 'folderPath',
      },
    ],
  };
}
