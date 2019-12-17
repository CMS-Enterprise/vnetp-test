import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { HelpersService } from 'src/app/services/helpers.service';
import { Subscription } from 'rxjs';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { VirtualMachine } from 'src/app/models/vmware/virtual-machine';

@Component({
  selector: 'app-vmware',
  templateUrl: './vmware.component.html',
  styleUrls: ['./vmware.component.css'],
})
export class VmwareComponent implements OnInit {
  virtualMachines: Array<VirtualMachine>;
  deletedVirtualMachines: Array<VirtualMachine>;

  editVirtualMachineIndex: number;

  virtualMachineModalMode: ModalMode;
  dirty: boolean;

  virtualMachineModalSubscription: Subscription;

  constructor(
    private ngxSmartModalService: NgxSmartModalService,
    private helperService: HelpersService,
  ) {}

  createVirtualMachine() {
    this.subscribeToVirtualMachineModal();
    this.virtualMachineModalMode = ModalMode.Create;
    this.ngxSmartModalService.getModal('virtualMachineModal').open();
  }

  editVirtualMachine(virtualMachine: VirtualMachine) {
    this.subscribeToVirtualMachineModal();
    this.virtualMachineModalMode = ModalMode.Edit;
    this.ngxSmartModalService.setModalData(
      this.helperService.deepCopy(virtualMachine),
      'virtualMachineModal',
    );
    this.editVirtualMachineIndex = this.virtualMachines.indexOf(virtualMachine);
    this.ngxSmartModalService.getModal('virtualMachineModal').open();
  }

  subscribeToVirtualMachineModal() {
    this.virtualMachineModalSubscription = this.ngxSmartModalService
      .getModal('virtualMachineModal')
      .onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
        const data = modal.getData() as VirtualMachine;

        if (data !== undefined) {
          this.saveVirtualMachine(data);
        }
        this.ngxSmartModalService.resetModalData('virtualMachineModal');
        this.virtualMachineModalSubscription.unsubscribe();
      });
  }

  saveVirtualMachine(virtualMachine: VirtualMachine) {
    if (this.virtualMachineModalMode === ModalMode.Create) {
      this.virtualMachines.push(virtualMachine);
    } else {
      this.virtualMachines[this.editVirtualMachineIndex] = virtualMachine;
    }
    this.dirty = true;
  }

  deleteVirtualMachine(virtualMachine: VirtualMachine) {
    const index = this.virtualMachines.indexOf(virtualMachine);
    if (index > -1) {
      this.virtualMachines.splice(index, 1);

      if (!this.deletedVirtualMachines) {
        this.deletedVirtualMachines = new Array<VirtualMachine>();
      }
      this.deletedVirtualMachines.push(virtualMachine);

      this.dirty = true;
    }
  }

  saveAll() {
    throw new Error('Not Implemented');
  }

  private unsubAll() {
    [this.virtualMachineModalSubscription].forEach(sub => {
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
    this.virtualMachines = new Array<VirtualMachine>();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
