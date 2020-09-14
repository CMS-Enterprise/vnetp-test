import { Component, OnInit } from '@angular/core';
import { V1ActifioVirtualMachinesService } from 'api_client/api/v1ActifioVirtualMachines.service';
import { ActifioVirtualMachineDto } from 'api_client/model/actifioVirtualMachineDto';
import { TableConfig } from 'src/app/common/table/table.component';

@Component({
  selector: 'app-vm-list',
  templateUrl: './vm-list.component.html',
})
export class VmListComponent implements OnInit {
  public virtualMachines: ActifioVirtualMachineDto[] = [];
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

  constructor(private actifioVirtualMachineService: V1ActifioVirtualMachinesService) {}

  ngOnInit(): void {
    this.actifioVirtualMachineService.v1ActifioVirtualMachinesGet().subscribe(data => {
      this.virtualMachines = data;
    });
  }
}
