import { Component, OnInit } from '@angular/core';
import { V1AgmApplicationsService } from 'api_client/api/v1AgmApplications.service';
import { ActifioApplicationDto } from 'api_client/model/actifioApplicationDto';
import { TableConfig } from 'src/app/common/table/table.component';

@Component({
  selector: 'app-vm-list',
  templateUrl: './vm-list.component.html',
})
export class VmListComponent implements OnInit {
  public virtualMachines: ActifioApplicationDto[] = [];
  public config: TableConfig = {
    description: 'List of Virtual Machines',
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
        name: 'SLA Profile Name',
        property: 'slaProfileName',
      },
      {
        name: 'SLA Template Name',
        property: 'slaTemplateName',
      },
    ],
  };

  constructor(private agmApplicationService: V1AgmApplicationsService) {}

  ngOnInit(): void {
    this.agmApplicationService.v1AgmApplicationsGet().subscribe(data => {
      this.virtualMachines = data;
    });
  }
}
