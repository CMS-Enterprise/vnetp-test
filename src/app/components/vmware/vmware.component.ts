import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { ModalMode } from 'src/app/models/other/modal-mode';
import {
  VmwareVirtualMachine,
  V1DatacentersService,
  V1VmwareVirtualMachinesService,
} from 'api_client';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { VirtualMachineModalDto } from 'src/app/models/vmware/virtual-machine-modal-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';

@Component({
  selector: 'app-vmware',
  templateUrl: './vmware.component.html',
  styleUrls: ['./vmware.component.css'],
})
export class VmwareComponent implements OnInit, OnDestroy {
  virtualMachines: Array<VmwareVirtualMachine>;
  ModalMode: ModalMode;
  virtualMachineModalSubscription: Subscription;
  currentDatacenterSubscription: Subscription;
  datacenterId: string;

  constructor(
    private ngxSmartModalService: NgxSmartModalService,
    private datacenterContextService: DatacenterContextService,
    private datacenterService: V1DatacentersService,
    private virtualMachineService: V1VmwareVirtualMachinesService,
  ) {}

  getVirtualMachines() {
    this.datacenterService
      .v1DatacentersIdGet({
        id: this.datacenterId,
        join: 'vmwareVirtualMachines',
      })
      .subscribe(data => {
        this.virtualMachines = data.vmwareVirtualMachines;
      });
  }

  createVirtualMachine() {
    this.openVirtualMachineModal(ModalMode.Create);
  }

  openVirtualMachineModal(modalMode: ModalMode, vm?: VmwareVirtualMachine) {
    if (modalMode === ModalMode.Edit && !vm) {
      throw new Error('VM required.');
    }

    const dto = new VirtualMachineModalDto();
    dto.ModalMode = modalMode;
    dto.DatacenterId = this.datacenterId;

    if (modalMode === ModalMode.Edit) {
      dto.VmwareVirtualMachine = vm;
    }

    this.subscribeToVirtualMachineModal();
    this.datacenterContextService.lockDatacenter();
    this.ngxSmartModalService.setModalData(dto, 'virtualMachineModal');
    this.ngxSmartModalService.getModal('virtualMachineModal').open();
  }

  subscribeToVirtualMachineModal() {
    this.virtualMachineModalSubscription = this.ngxSmartModalService
      .getModal('virtualMachineModal')
      .onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
        this.getVirtualMachines();
        this.ngxSmartModalService.resetModalData('virtualMachineModal');
        this.datacenterContextService.unlockDatacenter();
      });
  }

  deleteVirtualMachine(vm: VmwareVirtualMachine) {
    if (vm.provisionedAt) {
      throw new Error('Cannot delete provisioned object.');
    }

    const deleteDescription = vm.deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFunction = () => {
      if (!vm.deletedAt) {
        this.virtualMachineService
          .v1VmwareVirtualMachinesIdSoftDelete({ id: vm.id })
          .subscribe(data => {
            this.getVirtualMachines();
          });
      } else {
        this.virtualMachineService
          .v1VmwareVirtualMachinesIdDelete({ id: vm.id })
          .subscribe(data => {
            this.getVirtualMachines();
          });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(
        `${deleteDescription} Network Object?`,
        `Do you want to ${deleteDescription} network object "${vm.name}"?`,
      ),
      deleteFunction,
    );
  }

  restoreVirtualMachine(vm: VmwareVirtualMachine) {
    if (vm.deletedAt) {
      this.virtualMachineService
        .v1VmwareVirtualMachinesIdRestorePatch({
          id: vm.id,
        })
        .subscribe(data => {
          this.getVirtualMachines();
        });
    }
  }

  private confirmDeleteObject(
    modalDto: YesNoModalDto,
    deleteFunction: () => void,
  ) {
    this.ngxSmartModalService.setModalData(modalDto, 'yesNoModal');
    this.ngxSmartModalService.getModal('yesNoModal').open();
    const yesNoModalSubscription = this.ngxSmartModalService
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
      this.virtualMachineModalSubscription,
      this.currentDatacenterSubscription,
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
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(
      cd => {
        if (cd) {
          this.datacenterId = cd.id;
          this.getVirtualMachines();
        }
      },
    );
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
