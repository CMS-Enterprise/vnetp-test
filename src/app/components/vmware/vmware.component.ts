import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { VmwareVirtualMachine, V1DatacentersService } from 'api_client';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { VirtualMachineModalDto } from 'src/app/models/vmware/virtual-machine-modal-dto';

@Component({
  selector: 'app-vmware',
  templateUrl: './vmware.component.html',
  styleUrls: ['./vmware.component.css'],
})
export class VmwareComponent implements OnInit {
  virtualMachines: Array<VmwareVirtualMachine>;
  deletedVirtualMachines: Array<VmwareVirtualMachine>;
  editVirtualMachineIndex: number;
  ModalMode: ModalMode;
  dirty: boolean;
  virtualMachineModalSubscription: Subscription;
  currentDatacenterSubscription: Subscription;
  datacenterId: string;

  constructor(
    private ngxSmartModalService: NgxSmartModalService,
    private datacenterContextService: DatacenterContextService,
    private datacenterService: V1DatacentersService,
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

  // editVirtualMachine(
  //   modalMode: ModalMode,
  //   virtualMachine: VmwareVirtualMachine,
  // ) {
  //   this.subscribeToVirtualMachineModal();
  //   this.ModalMode = ModalMode.Edit;
  //   this.ngxSmartModalService.setModalData(
  //     this.helperService.deepCopy(virtualMachine),
  //     'virtualMachineModal',
  //   );
  //   this.editVirtualMachineIndex = this.virtualMachines.indexOf(virtualMachine);
  //   this.ngxSmartModalService.getModal('virtualMachineModal').open();
  // }

  subscribeToVirtualMachineModal() {
    this.virtualMachineModalSubscription = this.ngxSmartModalService
      .getModal('virtualMachineModal')
      .onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
        this.getVirtualMachines();
        this.ngxSmartModalService.resetModalData('virtualMachineModal');
        this.datacenterContextService.unlockDatacenter();
      });
  }

  saveVirtualMachine(virtualMachine: VmwareVirtualMachine) {
    if (this.ModalMode === ModalMode.Create) {
      this.virtualMachines.push(virtualMachine);
    } else {
      this.virtualMachines[this.editVirtualMachineIndex] = virtualMachine;
    }
    this.dirty = true;
  }

  // deleteVirtualMachine(virtualMachine: VmwareVirtualMachine) {
  //   const index = this.virtualMachines.indexOf(virtualMachine);
  //   if (index > -1) {
  //     this.virtualMachines.splice(index, 1);

  //     if (!this.deletedVirtualMachines) {
  //       this.deletedVirtualMachines = new Array<VmwareVirtualMachine>();
  //     }
  //     this.deletedVirtualMachines.push(virtualMachine);

  //     this.dirty = true;
  //   }
  // }

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
