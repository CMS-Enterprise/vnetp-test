import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
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
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { NameValidator } from 'src/app/validators/name-validator';
import ConversionUtil from 'src/app/utils/ConversionUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

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
    if (virtualDisk.provisionedAt) {
      throw new Error('Cannot delete provisioned object.');
    }

    const { deletedAt, id, name } = virtualDisk;
    const deleteDescription = deletedAt ? 'Delete' : 'Soft-Delete';
    const deleteFunction = () => {
      if (!deletedAt) {
        this.virtualDiskService.v1VmwareVirtualDisksIdSoftDelete({ id }).subscribe(() => {
          this.getVirtualDisks();
        });
      } else {
        this.virtualDiskService.v1VmwareVirtualDisksIdDelete({ id }).subscribe(() => {
          this.getVirtualDisks();
        });
      }
    };

    SubscriptionUtil.subscribeToYesNoModal(
      new YesNoModalDto(`${deleteDescription} Virtual Disk?`, `Do you want to ${deleteDescription} virtual disk "${name}"?`),
      this.ngx,
      deleteFunction,
    );
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
    if (networkAdapter.provisionedAt) {
      throw new Error('Cannot delete provisioned object.');
    }

    const { deletedAt, id, name } = networkAdapter;
    const deleteDescription = networkAdapter.deletedAt ? 'Delete' : 'Soft-Delete';
    const deleteFunction = () => {
      if (!deletedAt) {
        this.networkAdapterService.v1VmwareNetworkAdapterIdSoftDelete({ id }).subscribe(() => {
          this.getNetworkAdapters();
        });
      } else {
        this.networkAdapterService.v1VmwareNetworkAdapterIdDelete({ id }).subscribe(() => {
          this.getNetworkAdapters();
        });
      }
    };

    SubscriptionUtil.subscribeToYesNoModal(
      new YesNoModalDto(`${deleteDescription} Network Adapter?`, `Do you want to ${deleteDescription} network adapter "${name}"?`),
      this.ngx,
      deleteFunction,
    );
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

    if (!dto.ModalMode) {
      throw Error('Modal Mode not set.');
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
      name: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100), NameValidator])],
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
    return this.ngx.getModal('networkAdapterModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      this.getNetworkAdapters();
      this.ngx.resetModalData('networkAdapterModal');
    });
  }

  private subscribeToVirtualDiskModal(): Subscription {
    return this.ngx.getModal('virtualDiskModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      this.getVirtualDisks();
      this.ngx.resetModalData('virtualDiskModal');
    });
  }

  private createVmwareVirtualMachine(vmwareVirtualMachine: VmwareVirtualMachine): void {
    vmwareVirtualMachine.name = this.form.value.name;
    vmwareVirtualMachine.datacenterId = this.DatacenterId;

    this.virtualMachineService.v1VmwareVirtualMachinesPost({ vmwareVirtualMachine }).subscribe(
      data => {
        this.closeModal();
      },
      error => {},
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
        data => {
          this.closeModal();
        },
        error => {},
      );
  }

  ngOnInit() {
    this.buildForm();
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.virtualDiskModalSubscription, this.networkAdapterModalSubscription]);
  }
}
