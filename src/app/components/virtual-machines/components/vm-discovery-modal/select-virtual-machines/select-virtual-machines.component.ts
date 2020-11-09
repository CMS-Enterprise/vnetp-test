import { Component, Input, OnInit, Output, TemplateRef, ViewChild, EventEmitter } from '@angular/core';
import {
  ActifioImportApplicationsToClusterDto,
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
  sourceClusterId: string;
}

@Component({
  selector: 'app-select-virtual-machines',
  templateUrl: './select-virtual-machines.component.html',
  styles: ['.loading { display: flex; flex-direction: column; align-items: center'],
})
export class SelectVirtualMachinesComponent implements OnInit {
  @ViewChild('selectVirtualMachineToggleTemplate', { static: false }) selectVirtualMachineToggleTemplate: TemplateRef<any>;

  @Input() vcenterId: string;
  @Output() virtualMachinesAdded = new EventEmitter<ActifioApplicationDto[]>();

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
    this.selectedVirtualMachineIds = new Set();
    this.selectableVirtualMachines = [];
    this.isLoading = false;
    this.ngx.close('vmDiscoveryModal');
  }

  public selectVirtualMachines(): void {
    if (this.selectedVirtualMachineIds.size === 0) {
      return;
    }

    const selectedVirtualMachines = this.selectableVirtualMachines.filter(vm => {
      return this.selectedVirtualMachineIds.has(vm.id);
    });

    const clusterObjects = Array.from(
      new Set(selectedVirtualMachines.map(vm => ({ clusterName: vm.applianceName, sourceClusterId: vm.sourceClusterId }))),
    );

    const clusters: ActifioImportApplicationsToClusterDto[] = clusterObjects.map(cluster => {
      const virtualMachinesOnCluster = selectedVirtualMachines.filter(vm => vm.applianceName === cluster.clusterName);
      return {
        clusterName: cluster.clusterName,
        sourceClusterId: cluster.sourceClusterId,
        applicationUUIDs: virtualMachinesOnCluster.map(vm => vm.id),
        applicationNames: virtualMachinesOnCluster.map(vm => vm.name),
      };
    });

    this.isLoading = true;
    this.agmApplicationService
      .v1AgmApplicationsImportPost({
        actifioImportApplicationsDto: {
          clusters,
          hostId: this.vcenterId,
        },
      })
      .subscribe(
        (applications: ActifioApplicationDto[]) => {
          this.isLoading = false;
          this.virtualMachinesAdded.emit(applications);
        },
        () => {
          this.isLoading = false;
          this.virtualMachinesAdded.emit([]);
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
    const { applicationId, clusterName, discoveredId, isManaged, folderPath, name, sourceClusterId } = discoveredVM;
    return {
      folderPath,
      isManaged,
      name,
      applianceName: clusterName,
      isNew: !applicationId,
      id: applicationId || discoveredId,
      isSelected: false,
      sourceClusterId,
    };
  }
}
