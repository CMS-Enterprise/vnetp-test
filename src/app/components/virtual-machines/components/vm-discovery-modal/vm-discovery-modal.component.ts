import { ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { ActifioApplicationDto, ActifioHostDto, V1AgmHostsService } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { TableConfig } from 'src/app/common/table/table.component';

interface SelectableVirtualMachine extends ActifioApplicationDto {
  isSelected: boolean;
}

@Component({
  selector: 'app-vm-discovery-modal',
  templateUrl: './vm-discovery-modal.component.html',
  styles: ['.loading { display: flex; flex-direction: column; align-items: center'],
})
export class VmDiscoveryModalComponent {
  // Templates
  @ViewChild('selectVCenterTemplate', { static: false }) selectVCenterTemplate: TemplateRef<any>;
  @ViewChild('selectVCenterToggleTemplate', { static: false }) selectVCenterToggleTemplate: TemplateRef<any>;
  @ViewChild('selectVirtualMachinesTemplate', { static: false }) selectVirtualMachinesTemplate: TemplateRef<any>;
  @ViewChild('selectVirtualMachineToggleTemplate', { static: false }) selectVirtualMachineToggleTemplate: TemplateRef<any>;

  // vCenters
  public vCenterConfig: TableConfig = {
    description: 'List of vCenters',
    columns: [
      { name: '', template: () => this.selectVCenterToggleTemplate },
      { name: 'Name', property: 'hostName' },
      { name: 'IP Address', property: 'ipAddress' },
    ],
  };
  public vCenters: ActifioHostDto[] = [];
  public isLoadingVCenters = false;
  public selectedVCenterId: number;

  // Virtual Machines
  public isLoadingVirtualMachines = false;
  public selectedVirtualMachineIds = new Set();
  public selectableVirtualMachines: SelectableVirtualMachine[] = [];
  public virtualMachineConfig: TableConfig = {
    description: 'List of Virtual Machines on vCenter',
    columns: [
      { name: '', template: () => this.selectVirtualMachineToggleTemplate },
      { name: 'Name', property: 'name' },
      { name: 'Folder Path', property: 'folderPath' },
      { name: 'Managed?', property: 'isManaged' },
    ],
  };

  public currentDiscoveryStepTemplate: TemplateRef<any>;

  constructor(private changeRef: ChangeDetectorRef, private ngx: NgxSmartModalService, private agmHostService: V1AgmHostsService) {}

  public onLoad(): void {
    this.loadVCenters();
    this.currentDiscoveryStepTemplate = this.selectVCenterTemplate;
    this.changeRef.detectChanges();
  }

  public onClose(): void {
    this.ngx.resetModalData('vmDiscoveryModal');
    this.ngx.close('vmDiscoveryModal');

    this.resetVCenter();
    this.resetVirtualMachines();
  }

  public selectVCenter(): void {
    if (!this.selectedVCenterId) {
      return;
    }
    this.currentDiscoveryStepTemplate = this.selectVirtualMachinesTemplate;
    this.loadVirtualMachinesOnHost(this.selectedVCenterId);
  }

  public selectVirtualMachines(): void {
    // todo: Implement
  }

  public selectVirtualMachine(id: string): void {
    if (this.selectedVirtualMachineIds.has(id)) {
      this.selectedVirtualMachineIds.delete(id);
    } else {
      this.selectedVirtualMachineIds.add(id);
    }
  }

  private loadVCenters(): void {
    this.isLoadingVCenters = true;
    this.agmHostService.v1AgmHostsGet().subscribe(data => {
      this.vCenters = data;
      this.isLoadingVCenters = false;
    });
  }

  private loadVirtualMachinesOnHost(hostId: number): void {
    this.isLoadingVirtualMachines = true;
    this.agmHostService.v1AgmHostsHostIdDiscoveredApplicationsGet({ hostId }).subscribe((data: ActifioApplicationDto[]) => {
      this.selectableVirtualMachines = data.map(application => {
        return {
          ...application,
          isSelected: false,
        };
      });
      this.isLoadingVirtualMachines = false;
    });
  }

  private resetVCenter(): void {
    this.selectedVCenterId = null;
    this.vCenters = [];
    this.isLoadingVCenters = false;
  }

  private resetVirtualMachines(): void {
    this.selectedVirtualMachineIds = new Set();
    this.selectableVirtualMachines = [];
    this.isLoadingVirtualMachines = false;
    this.selectedVirtualMachineIds.clear();
  }
}
