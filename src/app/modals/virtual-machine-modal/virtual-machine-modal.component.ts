import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import {
  V1VmwareVirtualMachinesService,
  VmwareVirtualMachine,
  VmwareVirtualDisk,
  V1VmwareVirtualDisksService,
  VmwareNetworkAdapter,
  V1VmwareNetworkAdapterService,
} from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { VirtualMachineModalDto } from 'src/app/models/vmware/virtual-machine-modal-dto';
import { Subscription } from 'rxjs';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';

@Component({
  selector: 'app-virtual-machine-modal',
  templateUrl: './virtual-machine-modal.component.html',
  styleUrls: ['./virtual-machine-modal.component.css'],
})
export class VirtualMachineModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;
  ModalMode: ModalMode;
  DatacenterId: string;
  VirtualMachineId: string;
  virtualDiskModalSubscription: Subscription;
  networkAdapterModalSubscription: Subscription;
  virtualDisks: Array<VmwareVirtualDisk>;
  networkAdapters: Array<VmwareNetworkAdapter>;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private virtualMachineService: V1VmwareVirtualMachinesService,
    private virtualDiskService: V1VmwareVirtualDisksService,
    private networkAdapterService: V1VmwareNetworkAdapterService,
  ) {}

  getVirtualDisks() {
    this.virtualMachineService
      .v1VmwareVirtualMachinesIdGet({
        id: this.VirtualMachineId,
        join: 'virtualDisks,networkAdapters',
      })
      .subscribe(data => {
        this.virtualDisks = data.virtualDisks;
      });
  }

  getNetworkAdapters() {
    this.virtualMachineService
      .v1VmwareVirtualMachinesIdGet({
        id: this.VirtualMachineId,
        join: 'networkAdapters',
      })
      .subscribe(data => {
        this.networkAdapters = data.networkAdapters;
      });
  }

  openVirtualDiskModal() {
    const dto = new VirtualMachineModalDto();

    dto.VirtualMachineId = this.VirtualMachineId;

    this.subscribeToVirtualDiskModal();
    this.ngx.setModalData(dto, 'virtualDiskModal');
    this.ngx.getModal('virtualDiskModal').open();
  }

  subscribeToVirtualDiskModal() {
    this.virtualDiskModalSubscription = this.ngx
      .getModal('virtualDiskModal')
      .onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
        this.getVirtualDisks();
        this.ngx.resetModalData('virtualDiskModal');
      });
  }

  openNetworkAdapterModal() {
    const dto = new VirtualMachineModalDto();

    dto.VirtualMachineId = this.VirtualMachineId;
    dto.DatacenterId = this.DatacenterId;

    this.subscribeToVirtualDiskModal();
    this.ngx.setModalData(dto, 'networkAdapterModal');
    this.ngx.getModal('networkAdapterModal').open();
  }

  subscribeToNetworkAdapterModal() {
    this.networkAdapterModalSubscription = this.ngx
      .getModal('networkAdapterModal')
      .onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
        this.getNetworkAdapters();
        this.ngx.resetModalData('networkAdapterModal');
      });
  }

  deleteVirtualDisk(v: VmwareVirtualDisk) {
    if (v.provisionedAt) {
      throw new Error('Cannot delete provisioned object.');
    }

    const deleteDescription = v.deletedAt ? 'Delete' : 'Soft-Delete';
    const deleteFunction = () => {
      if (!v.deletedAt) {
        this.virtualDiskService
          .v1VmwareVirtualDisksIdSoftDelete({ id: v.id })
          .subscribe(data => {
            this.getVirtualDisks();
          });
      } else {
        this.virtualDiskService
          .v1VmwareVirtualDisksIdDelete({ id: v.id })
          .subscribe(data => {
            this.getVirtualDisks();
          });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(
        `${deleteDescription} Virtual Disk?`,
        `Do you want to ${deleteDescription} virtual disk "${v.name}"?`,
      ),
      deleteFunction,
    );
  }

  restoreVirtualDisk(v: VmwareVirtualDisk) {
    if (v.deletedAt) {
      this.virtualDiskService
        .v1VmwareVirtualDisksIdRestorePatch({
          id: v.id,
        })
        .subscribe(data => {
          this.getVirtualDisks();
        });
    }
  }

  deleteNetworkAdapter(n: VmwareNetworkAdapter) {
    if (n.provisionedAt) {
      throw new Error('Cannot delete provisioned object.');
    }

    const deleteDescription = n.deletedAt ? 'Delete' : 'Soft-Delete';
    const deleteFunction = () => {
      if (!n.deletedAt) {
        this.networkAdapterService
          .v1VmwareNetworkAdapterIdSoftDelete({ id: n.id })
          .subscribe(data => {
            this.getNetworkAdapters();
          });
      } else {
        this.networkAdapterService
          .v1VmwareNetworkAdapterIdDelete({ id: n.id })
          .subscribe(data => {
            this.getNetworkAdapters();
          });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(
        `${deleteDescription} Network Adapter?`,
        `Do you want to ${deleteDescription} network adapter "${n.name}"?`,
      ),
      deleteFunction,
    );
  }

  restoreNetworkAdapter(n: VmwareNetworkAdapter) {
    if (n.deletedAt) {
      this.networkAdapterService
        .v1VmwareNetworkAdapterIdRestorePatch({
          id: n.id,
        })
        .subscribe(data => {
          this.getNetworkAdapters();
        });
    }
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const virtualMachine = {} as VmwareVirtualMachine;

    virtualMachine.description = this.form.value.description;
    virtualMachine.cpuCores = this.form.value.cpuCount;
    virtualMachine.cpuCoresPerSocket = parseInt(this.form.value.coreCount, 10); // TO DO - figure out type problem
    virtualMachine.cpuReserved = this.form.value.cpuReserved;
    virtualMachine.memorySize = this.convertGbToBytes(
      this.form.value.memorySize,
    );
    virtualMachine.memoryReserved = this.form.value.memoryReserved;

    this.ngx.resetModalData('virtualMachineModal');
    this.ngx.setModalData(
      Object.assign({}, virtualMachine),
      'virtualMachineModal',
    );

    if (this.ModalMode === ModalMode.Create) {
      virtualMachine.name = this.form.value.name;
      virtualMachine.datacenterId = this.DatacenterId;

      this.virtualMachineService
        .v1VmwareVirtualMachinesPost({
          vmwareVirtualMachine: virtualMachine,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    } else {
      this.virtualMachineService
        .v1VmwareVirtualMachinesIdPut({
          id: this.VirtualMachineId,
          vmwareVirtualMachine: virtualMachine,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    }
  }

  cancel() {
    this.closeModal();
  }

  get f() {
    return this.form.controls;
  }

  getData() {
    const dto = Object.assign(
      {},
      this.ngx.getModalData('virtualMachineModal') as VirtualMachineModalDto,
    );

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
    } else {
      this.ModalMode = dto.ModalMode;

      if (this.ModalMode === ModalMode.Edit) {
        this.VirtualMachineId = dto.VmwareVirtualMachine.id;

        this.getVirtualDisks();
        this.getNetworkAdapters();
      }
    }

    const virtualMachine = dto.VmwareVirtualMachine;

    if (virtualMachine !== undefined) {
      let convertedMemorySize = this.convertBytesToGb(
        virtualMachine.memorySize,
      );

      this.form.controls.name.setValue(virtualMachine.name);
      this.form.controls.description.setValue(virtualMachine.description);
      this.form.controls.cpuCount.setValue(virtualMachine.cpuCores);
      this.form.controls.coreCount.setValue(virtualMachine.cpuCoresPerSocket);
      this.form.controls.cpuReserved.setValue(virtualMachine.cpuReserved);
      this.form.controls.memorySize.setValue(convertedMemorySize);
      this.form.controls.memoryReserved.setValue(virtualMachine.memoryReserved);
    }
    this.ngx.resetModalData('virtualMachineModal');
  }

  private convertGbToBytes(val) {
    let convertedVal = val * 1000000000;

    return convertedVal;
  }

  private convertBytesToGb(val) {
    let convertedVal = val / 1000000000;

    return convertedVal;
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: [''],
      description: [''],
      cpuCount: [''],
      coreCount: [''],
      cpuReserved: [''],
      memorySize: [''],
      memoryReserved: [''],
    });
  }

  private closeModal() {
    this.ngx.close('virtualMachineModal');
    this.reset();
  }

  private reset() {
    this.submitted = false;
    this.buildForm();
  }

  private confirmDeleteObject(
    modalDto: YesNoModalDto,
    deleteFunction: () => void,
  ) {
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();
    const yesNoModalSubscription = this.ngx
      .getModal('yesNoModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        const data = modal.getData() as YesNoModalDto;
        modal.removeData();
        if (data && data.modalYes) {
          deleteFunction();
        }
        yesNoModalSubscription.unsubscribe();
      });
  }

  private unsubAll() {
    [
      this.virtualDiskModalSubscription,
      this.networkAdapterModalSubscription,
    ].forEach(sub => {
      try {
        if (sub) {
          sub.unsubscribe();
        }
      } catch (e) {
        console.error(e);
      }
    });
  }

  ngOnInit() {
    this.buildForm();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
