import { Component, Input, OnInit, Output, TemplateRef, ViewChild, EventEmitter } from '@angular/core';
import {
  ActifioApplicationDto,
  ActifioDiscoveredVMDto,
  V1ActifioGmHostsService,
  V1ActifioGmApplicationsService,
  ActifioHostDto,
} from 'client';
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
  sourceClusterIds: string[];
}

@Component({
  selector: 'app-select-virtual-machines',
  templateUrl: './select-virtual-machines.component.html',
  styles: ['.loading { display: flex; flex-direction: column; align-items: center'],
})
export class SelectVirtualMachinesComponent implements OnInit {
  @ViewChild('selectVirtualMachineToggleTemplate') selectVirtualMachineToggleTemplate: TemplateRef<any>;

  @Input() vCenter: ActifioHostDto;
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
    private agmHostService: V1ActifioGmHostsService,
    private agmApplicationService: V1ActifioGmApplicationsService,
  ) {}

  ngOnInit(): void {
    this.loadVirtualMachinesOnHost(this.vCenter.id);
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

    const clusterNames = Array.from(new Set(selectedVirtualMachines.map(vm => vm.applianceName)));

    const clusters = clusterNames.map(clusterName => {
      const applications = selectedVirtualMachines.filter(vm => vm.applianceName === clusterName);
      return {
        clusterName,
        applicationUUIDs: applications.map(a => a.id),
        applicationNames: applications.map(a => a.name),
      };
    });

    this.isLoading = true;
    this.agmApplicationService
      .importApplicationsActifioApplication({
        actifioImportApplicationsDto: {
          clusters,
          hostId: this.vCenter.id,
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
    this.agmHostService.discoverApplicationsActifioHost({ hostId }).subscribe(
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
    const { applicationId, clusterName, discoveredId, isManaged, folderPath, name, sourceClusters } = discoveredVM;
    return {
      folderPath,
      isManaged,
      name,
      applianceName: clusterName,
      isNew: !applicationId,
      id: applicationId || discoveredId,
      isSelected: false,
      sourceClusterIds: sourceClusters.map(c => c.id),
    };
  }
}
