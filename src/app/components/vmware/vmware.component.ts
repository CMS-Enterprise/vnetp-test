import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { HelpersService } from 'src/app/services/helpers.service';
import { Subscription } from 'rxjs';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { V1TiersService, Tier, VmwareVirtualMachine } from 'api_client';

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
  tiers: Tier[];
  currentTier: Tier;

  constructor(
    private ngxSmartModalService: NgxSmartModalService,
    private helperService: HelpersService,
    private tierService: V1TiersService,
  ) {}

  getVirtualMachines() {
    this.tierService
      .v1TiersIdGet({ id: this.currentTier.id, join: 'virtualMachines' })
      .subscribe(data => {
        this.virtualMachines = data.virtualMachines;
      });
  }

  openVirtualMachineModal(modalMode: ModalMode, vm?: VmwareVirtualMachine) {
    if (modalMode === ModalMode.Edit && !vm) {
      throw new Error('VM required.');
    }

    let _vm;
    if (!vm) {
      _vm = {} as VmwareVirtualMachine;
      _vm.name = 'Hi';
    } else {
      _vm = vm;
    }
    _vm.ModalMode = modalMode;
    // vm.TierId = this.currentTier.id;

    this.subscribeToVirtualMachineModal();
    // this.datacenterService.lockDatacenter();
    this.ngxSmartModalService.setModalData(
      this.helperService.deepCopy(_vm),
      'virtualMachineModal',
    );
    this.ngxSmartModalService.getModal('virtualMachineModal').open();
  }

  createVirtualMachine(modalMode: ModalMode) {
    this.subscribeToVirtualMachineModal();
    this.ModalMode = ModalMode.Create;
    this.ngxSmartModalService.getModal('virtualMachineModal').open();
  }

  editVirtualMachine(
    modalMode: ModalMode,
    virtualMachine: VmwareVirtualMachine,
  ) {
    this.subscribeToVirtualMachineModal();
    this.ModalMode = ModalMode.Edit;
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
        const data = modal.getData() as VmwareVirtualMachine;

        if (data !== undefined) {
          this.saveVirtualMachine(data);
        }
        this.ngxSmartModalService.resetModalData('virtualMachineModal');
        this.virtualMachineModalSubscription.unsubscribe();
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

  deleteVirtualMachine(virtualMachine: VmwareVirtualMachine) {
    const index = this.virtualMachines.indexOf(virtualMachine);
    if (index > -1) {
      this.virtualMachines.splice(index, 1);

      if (!this.deletedVirtualMachines) {
        this.deletedVirtualMachines = new Array<VmwareVirtualMachine>();
      }
      this.deletedVirtualMachines.push(virtualMachine);

      this.dirty = true;
    }
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
    this.virtualMachines = new Array<VmwareVirtualMachine>();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
