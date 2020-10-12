import { Component, Input, OnInit, Output, TemplateRef, ViewChild, EventEmitter } from '@angular/core';
import { ActifioDiscoveredVMDto, V1AgmHostsService } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { TableConfig } from 'src/app/common/table/table.component';

interface SelectableVirtualMachine {
  folderPath: string;
  id: string;
  isManaged: boolean;
  isSelected: boolean;
  name: string;
}

@Component({
  selector: 'app-select-virtual-machines',
  templateUrl: './select-virtual-machines.component.html',
  styles: ['.loading { display: flex; flex-direction: column; align-items: center'],
})
export class SelectVirtualMachinesComponent implements OnInit {
  @ViewChild('selectVirtualMachineToggleTemplate', { static: false }) selectVirtualMachineToggleTemplate: TemplateRef<any>;

  @Input() vcenterId: string;
  @Output() virtualMachinesSelected = new EventEmitter<Set<string>>();

  public config: TableConfig = {
    description: 'List of Virtual Machines on vCenter',
    columns: [
      { name: '', template: () => this.selectVirtualMachineToggleTemplate },
      { name: 'Name', property: 'name' },
      { name: 'Folder Path', property: 'folderPath' },
      { name: 'Managed?', property: 'isManaged' },
    ],
  };
  public isLoading = false;
  public selectedVirtualMachineIds = new Set<string>();
  public selectableVirtualMachines: SelectableVirtualMachine[] = [];

  constructor(private ngx: NgxSmartModalService, private agmHostService: V1AgmHostsService) {}

  ngOnInit(): void {
    this.loadVirtualMachinesOnHost(this.vcenterId);
  }

  public onCancel(): void {
    this.ngx.close('vmDiscoveryModal');
  }

  public selectVirtualMachines(): void {
    if (this.selectedVirtualMachineIds.size === 0) {
      return;
    }
    this.virtualMachinesSelected.emit(this.selectedVirtualMachineIds);
  }

  public selectVirtualMachine(id: string): void {
    if (this.selectedVirtualMachineIds.has(id)) {
      this.selectedVirtualMachineIds.delete(id);
    } else {
      this.selectedVirtualMachineIds.add(id);
    }
  }

  public loadVirtualMachinesOnHost(hostId: string): void {
    this.isLoading = true;
    this.agmHostService.v1AgmHostsHostIdDiscoveredApplicationsGet({ hostId }).subscribe((data: ActifioDiscoveredVMDto[]) => {
      this.selectableVirtualMachines = data.map(discoveredVM => {
        const { applicationId, discoveredId, isManaged, folderPath, name } = discoveredVM;
        return {
          folderPath,
          isManaged,
          name,
          id: applicationId || discoveredId,
          isSelected: false,
        };
      });
      this.isLoading = false;
    });
  }
}
