import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  V1VmwareVirtualMachinesService,
  VmwareVirtualMachine,
  VmwareVirtualDisk,
  V1VmwareVirtualDisksService,
  VmwareNetworkAdapter,
  V1VmwareNetworkAdapterService,
  V1PriorityGroupsService,
  PriorityGroup,
} from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { VirtualMachineModalDto } from 'src/app/models/vmware/virtual-machine-modal-dto';
import { Subscription } from 'rxjs';
import { NameValidator } from 'src/app/validators/name-validator';
import ConversionUtil from 'src/app/utils/ConversionUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { EntityService } from 'src/app/services/entity.service';

@Component({
  selector: 'app-virtual-machine-modal',
  templateUrl: './virtual-machine-modal.component.html',
})
export class VirtualMachineModalComponent implements OnInit, OnDestroy {
  public ConversionUtil = ConversionUtil;

  form: FormGroup;
  submitted: boolean;
  ModalMode: ModalMode;
  DatacenterId: string;
  VirtualMachineId: string;

  public networkAdapters: VmwareNetworkAdapter[] = [];
  public priorityGroups: PriorityGroup[] = [];
  public virtualDisks: VmwareVirtualDisk[] = [];

  private networkAdapterModalSubscription: Subscription;
  private virtualDiskModalSubscription: Subscription;

  constructor(
    private entityService: EntityService,
    private formBuilder: FormBuilder,
    private networkAdapterService: V1VmwareNetworkAdapterService,
    private ngx: NgxSmartModalService,
    private priorityGroupService: V1PriorityGroupsService,
    private virtualDiskService: V1VmwareVirtualDisksService,
    private virtualMachineService: V1VmwareVirtualMachinesService,
  ) {}

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('virtualMachineModal');
    this.reset();
  }

  public openVirtualDiskModal(): void {
    const dto = new VirtualMachineModalDto();

    dto.VirtualMachineId = this.VirtualMachineId;

    this.virtualDiskModalSubscription = this.subscribeToVirtualDiskModal();
    this.ngx.setModalData(dto, 'virtualDiskModal');
    this.ngx.getModal('virtualDiskModal').open();
  }

  public openNetworkAdapterModal(): void {
    const dto = new VirtualMachineModalDto();

    dto.VirtualMachineId = this.VirtualMachineId;
    dto.DatacenterId = this.DatacenterId;

    this.networkAdapterModalSubscription = this.subscribeToNetworkAdapterModal();
    this.ngx.setModalData(dto, 'networkAdapterModal');
    this.ngx.getModal('networkAdapterModal').open();
  }

  public deleteVirtualDisk(virtualDisk: VmwareVirtualDisk): void {
    this.entityService.deleteEntity(virtualDisk, {
      entityName: 'Virtual Disk',
      delete$: this.virtualDiskService.v1VmwareVirtualDisksIdDelete({ id: virtualDisk.id }),
      softDelete$: this.virtualDiskService.v1VmwareVirtualDisksIdSoftDelete({ id: virtualDisk.id }),
      onSuccess: () => this.getVirtualDisks(),
    });
  }

  public restoreVirtualDisk(virtualDisk: VmwareVirtualDisk): void {
    if (!virtualDisk.deletedAt) {
      return;
    }
    this.virtualDiskService.v1VmwareVirtualDisksIdRestorePatch({ id: virtualDisk.id }).subscribe(() => {
      this.getVirtualDisks();
    });
  }

  public deleteNetworkAdapter(networkAdapter: VmwareNetworkAdapter): void {
    this.entityService.deleteEntity(networkAdapter, {
      entityName: 'Network Adapter',
      delete$: this.networkAdapterService.v1VmwareNetworkAdapterIdDelete({ id: networkAdapter.id }),
      softDelete$: this.networkAdapterService.v1VmwareNetworkAdapterIdSoftDelete({ id: networkAdapter.id }),
      onSuccess: () => this.getVirtualDisks(),
    });
  }

  public restoreNetworkAdapter(networkAdapter: VmwareNetworkAdapter): void {
    if (!networkAdapter.deletedAt) {
      return;
    }
    this.networkAdapterService.v1VmwareNetworkAdapterIdRestorePatch({ id: networkAdapter.id }).subscribe(() => {
      this.getNetworkAdapters();
    });
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const virtualMachine = {} as VmwareVirtualMachine;
    virtualMachine.description = this.form.value.description;
    virtualMachine.cpuCores = Number.parseInt(this.form.value.cpuCount, 10);
    virtualMachine.cpuCoresPerSocket = Number.parseInt(this.form.value.coreCount, 10);
    virtualMachine.cpuReserved = ConversionUtil.convertStringToBoolean(this.form.value.cpuReserved);
    virtualMachine.memorySize = ConversionUtil.convertGbToBytes(this.form.value.memorySize);
    virtualMachine.memoryReserved = ConversionUtil.convertStringToBoolean(this.form.value.memoryReserved);
    virtualMachine.highPerformance = ConversionUtil.convertStringToBoolean(this.form.value.highPerformance);
    virtualMachine.priorityGroupId = this.form.value.priorityGroupId;

    this.ngx.resetModalData('virtualMachineModal');
    this.ngx.setModalData(Object.assign({}, virtualMachine), 'virtualMachineModal');

    if (this.ModalMode === ModalMode.Create) {
      this.createVmwareVirtualMachine(virtualMachine);
    } else {
      this.updateVmwareVirtualMachine(virtualMachine);
    }
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('virtualMachineModal') as VirtualMachineModalDto);

    if (dto.DatacenterId) {
      this.DatacenterId = dto.DatacenterId;
    }

    if (dto.VirtualMachineId) {
      this.VirtualMachineId = dto.VirtualMachineId;
    } else if (dto.VmwareVirtualMachine) {
      this.VirtualMachineId = dto.VmwareVirtualMachine.id;
    }

    this.ModalMode = dto.ModalMode;
    if (this.ModalMode === ModalMode.Edit) {
      this.VirtualMachineId = dto.VmwareVirtualMachine.id;

      this.getVirtualDisks();
      this.getNetworkAdapters();
    }
    this.loadPriorityGroups();

    const virtualMachine = dto.VmwareVirtualMachine;

    if (virtualMachine !== undefined) {
      const convertedMemorySize = ConversionUtil.convertBytesToGb(virtualMachine.memorySize);

      this.form.controls.name.setValue(virtualMachine.name);
      this.form.controls.description.setValue(virtualMachine.description);
      this.form.controls.cpuCount.setValue(virtualMachine.cpuCores);
      this.form.controls.coreCount.setValue(virtualMachine.cpuCoresPerSocket);
      this.form.controls.cpuReserved.setValue(virtualMachine.cpuReserved);
      this.form.controls.memorySize.setValue(convertedMemorySize);
      this.form.controls.memoryReserved.setValue(virtualMachine.memoryReserved);
      this.form.controls.highPerformance.setValue(virtualMachine.highPerformance);
      this.form.controls.priorityGroupId.setValue(virtualMachine.priorityGroupId || null);

      this.form.controls.name.disable();
    } else {
      this.form.controls.name.enable();
    }
    this.ngx.resetModalData('virtualMachineModal');
  }

  public reset() {
    this.submitted = false;
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      description: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(500)])],
      cpuCount: [null, Validators.required],
      coreCount: [null, Validators.required],
      cpuReserved: [false, Validators.required],
      memorySize: [null, Validators.required],
      memoryReserved: [false, Validators.required],
      highPerformance: [false, Validators.required],
      priorityGroupId: [null, Validators.required],
    });
  }

  private getVirtualDisks(): void {
    this.virtualMachineService
      .v1VmwareVirtualMachinesIdGet({
        id: this.VirtualMachineId,
        join: 'virtualDisks,networkAdapters',
      })
      .subscribe(data => {
        this.virtualDisks = data.virtualDisks;
      });
  }

  private getNetworkAdapters(): void {
    this.virtualMachineService
      .v1VmwareVirtualMachinesIdGet({
        id: this.VirtualMachineId,
        join: 'networkAdapters',
      })
      .subscribe(data => {
        this.networkAdapters = data.networkAdapters;
      });
  }

  private subscribeToNetworkAdapterModal(): Subscription {
    return this.ngx.getModal('networkAdapterModal').onAnyCloseEvent.subscribe(() => {
      this.getNetworkAdapters();
      this.ngx.resetModalData('networkAdapterModal');
    });
  }

  private subscribeToVirtualDiskModal(): Subscription {
    return this.ngx.getModal('virtualDiskModal').onAnyCloseEvent.subscribe(() => {
      this.getVirtualDisks();
      this.ngx.resetModalData('virtualDiskModal');
    });
  }

  private createVmwareVirtualMachine(vmwareVirtualMachine: VmwareVirtualMachine): void {
    vmwareVirtualMachine.name = this.form.value.name;
    vmwareVirtualMachine.datacenterId = this.DatacenterId;

    this.virtualMachineService.v1VmwareVirtualMachinesPost({ vmwareVirtualMachine }).subscribe(
      () => {
        this.closeModal();
      },
      () => {},
    );
  }

  private loadPriorityGroups(): void {
    this.priorityGroupService
      .v1PriorityGroupsGet({ filter: `datacenterId||eq||${this.DatacenterId}`, join: 'vmwareVirtualMachines' })
      .subscribe(data => {
        this.priorityGroups = data;
      });
  }

  private updateVmwareVirtualMachine(vmwareVirtualMachine: VmwareVirtualMachine): void {
    this.virtualMachineService
      .v1VmwareVirtualMachinesIdPut({
        id: this.VirtualMachineId,
        vmwareVirtualMachine,
      })
      .subscribe(
        () => {
          this.closeModal();
        },
        () => {},
      );
  }

  ngOnInit() {
    this.buildForm();
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.virtualDiskModalSubscription, this.networkAdapterModalSubscription]);
  }
}
