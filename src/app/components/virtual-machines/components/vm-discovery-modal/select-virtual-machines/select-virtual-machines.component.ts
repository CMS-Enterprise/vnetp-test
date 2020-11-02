import { Component, Input, OnInit, Output, TemplateRef, ViewChild, EventEmitter } from '@angular/core';
import {
  ActifioAddApplicationsToClusterDto,
  ActifioApplicationDto,
  ActifioDiscoveredVMDto,
  V1AgmApplicationsService,
  V1AgmHostsService,
} from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { TableConfig } from 'src/app/common/table/table.component';

interface SelectableVirtualMachine {
  applianceName: string;
  folderPath: string;
  id: string;
  isNew: boolean;
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
  @Output() virtualMachinesSelected = new EventEmitter<ActifioApplicationDto[]>();

  public config: TableConfig<SelectableVirtualMachine> = {
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

  constructor(
    private ngx: NgxSmartModalService,
    private agmHostService: V1AgmHostsService,
    private agmApplicationService: V1AgmApplicationsService,
  ) {}

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

    const selectedVirtualMachines = this.selectableVirtualMachines.filter(vm => {
      this.selectedVirtualMachineIds.has(vm.id);
    });

    const clusterNames = Array.from(new Set(selectedVirtualMachines.map(vm => vm.applianceName)));

    const clusters: ActifioAddApplicationsToClusterDto[] = clusterNames.map((clusterName: string) => {
      const virtualMachinesOnCluster = selectedVirtualMachines.filter(vm => vm.applianceName === clusterName);
      return {
        clusterName,
        applicationUUIDs: virtualMachinesOnCluster.map(vm => vm.id),
        applicationNames: virtualMachinesOnCluster.map(vm => vm.name),
      };
    });

    this.isLoading = true;
    this.agmApplicationService
      .v1AgmApplicationsBulkPost({
        actifioAddApplicationsDto: {
          clusters,
          hostId: this.vcenterId,
        },
      })
      .subscribe(
        (applications: ActifioApplicationDto[]) => {
          this.isLoading = false;
          this.virtualMachinesSelected.emit(applications);
        },
        () => {
          this.isLoading = false;
          this.virtualMachinesSelected.emit([]);
        },
      );
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
    this.agmHostService.v1AgmHostsHostIdDiscoveredApplicationsGet({ hostId }).subscribe(
      (data: ActifioDiscoveredVMDto[]) => {
        this.selectableVirtualMachines = data.map(discoveredVM => this.mapDiscoveredVM(discoveredVM)).filter(vm => vm.isNew);
        this.isLoading = false;
      },
      () => {
        this.selectableVirtualMachines = [];
        this.isLoading = false;
      },
    );
  }

  private mapDiscoveredVM(discoveredVM: ActifioDiscoveredVMDto): SelectableVirtualMachine {
    const { applicationId, clusterName, discoveredId, isManaged, folderPath, name } = discoveredVM;
    return {
      folderPath,
      isManaged,
      name,
      applianceName: clusterName,
      isNew: !applicationId,
      id: applicationId || discoveredId,
      isSelected: false,
    };
  }
}
