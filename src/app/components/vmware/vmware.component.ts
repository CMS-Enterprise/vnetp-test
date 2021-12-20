import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { VmwareVirtualMachine, V1DatacentersService, V1VmwareVirtualMachinesService } from 'client';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { VirtualMachineModalDto } from 'src/app/models/vmware/virtual-machine-modal-dto';
import ConversionUtil from 'src/app/utils/ConversionUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { Tab } from 'src/app/common/tabs/tabs.component';
import { EntityService } from 'src/app/services/entity.service';

enum TabName {
  VirtualMachines = 'Virtual Machines',
  PriorityGroups = 'Priority Groups',
}

@Component({
  selector: 'app-vmware',
  templateUrl: './vmware.component.html',
  styleUrls: ['./vmware.component.scss'],
})
export class VmwareComponent implements OnInit, OnDestroy {
  public datacenterId: string;
  public virtualMachines: Array<VmwareVirtualMachine>;

  public currentVMWarePage = 1;
  public perPage = 20;
  public highPerformanceVirtualMachines: VmwareVirtualMachine[] = [];
  public ungroupedVirtualMachines: VmwareVirtualMachine[] = [];
  public ModalMode = ModalMode;
  public ConversionUtil = ConversionUtil;

  public activeTabName = TabName.VirtualMachines;
  public tabs: Tab[] = [{ name: TabName.VirtualMachines }, { name: TabName.PriorityGroups }];
  public TabName = TabName;

  private currentDatacenterSubscription: Subscription;
  private virtualMachineModalSubscription: Subscription;

  constructor(
    private entityService: EntityService,
    private ngx: NgxSmartModalService,
    private datacenterContextService: DatacenterContextService,
    private datacenterService: V1DatacentersService,
    private virtualMachineService: V1VmwareVirtualMachinesService,
  ) {}

  public handleTabChange(tab: Tab): void {
    this.activeTabName = tab.name as TabName;
  }

  getVirtualMachines(): void {
    this.virtualMachineService
      .getManyVmwareVirtualMachine({ filter: [`datacenterId||eq||${this.datacenterId}`] })
      .subscribe((data: unknown) => {
        this.virtualMachines = data as VmwareVirtualMachine[];
        this.highPerformanceVirtualMachines = this.virtualMachines.filter(vm => vm.highPerformance);
        this.ungroupedVirtualMachines = this.virtualMachines.filter(vm => !vm.priorityGroupId);
      });
  }

  createVirtualMachine() {
    this.openVirtualMachineModal(ModalMode.Create);
  }

  openVirtualMachineModal(modalMode: ModalMode, vm?: VmwareVirtualMachine) {
    if (modalMode === ModalMode.Edit && !vm) {
      throw new Error('VM required');
    }

    const dto = new VirtualMachineModalDto();
    dto.ModalMode = modalMode;
    dto.DatacenterId = this.datacenterId;

    if (modalMode === ModalMode.Edit) {
      dto.VmwareVirtualMachine = vm;
    }

    this.subscribeToVirtualMachineModal();
    this.datacenterContextService.lockDatacenter();
    this.ngx.setModalData(dto, 'virtualMachineModal');
    this.ngx.getModal('virtualMachineModal').open();
  }

  subscribeToVirtualMachineModal() {
    this.virtualMachineModalSubscription = this.ngx.getModal('virtualMachineModal').onAnyCloseEvent.subscribe(() => {
      this.getVirtualMachines();
      this.ngx.resetModalData('virtualMachineModal');
      this.datacenterContextService.unlockDatacenter();
    });
  }

  public deleteVirtualMachine(vm: VmwareVirtualMachine): void {
    this.entityService.deleteEntity(vm, {
      entityName: 'Virtual Machine',
      delete$: this.virtualMachineService.deleteOneVmwareVirtualMachine({ id: vm.id }),
      softDelete$: this.virtualMachineService.softDeleteOneVmwareVirtualMachine({ id: vm.id }),
      onSuccess: () => this.getVirtualMachines(),
    });
  }

  restoreVirtualMachine(vm: VmwareVirtualMachine) {
    if (vm.deletedAt) {
      this.virtualMachineService
        .restoreOneVmwareVirtualMachine({
          id: vm.id,
        })
        .subscribe(() => {
          this.getVirtualMachines();
        });
    }
  }

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.datacenterId = cd.id;
        this.getVirtualMachines();
      }
    });
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.virtualMachineModalSubscription, this.currentDatacenterSubscription]);
  }
}
