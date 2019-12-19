import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  V1VmwareVirtualMachinesService,
  VmwareVirtualMachine,
} from 'api_client';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { NgxSmartModalComponent, NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-vmware-detail',
  templateUrl: './vmware-detail.component.html',
  styleUrls: ['./vmware-detail.component.css'],
})
export class VmwareDetailComponent implements OnInit {
  Id: string;
  VirtualMachine: VmwareVirtualMachine;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private virtualMachineService: V1VmwareVirtualMachinesService,
    private ngxSmartModalService: NgxSmartModalService,
  ) {}

  getVirtualMachine() {
    this.virtualMachineService
      .v1VmwareVirtualMachinesIdGet({
        id: this.Id,
      })
      .subscribe(data => {
        this.VirtualMachine = data;
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
          .v1VmwareVirtualMachinesIdSoftDelete({
            id: vm.id,
          })
          .subscribe(data => {
            this.getVirtualMachine();
          });
      } else {
        this.virtualMachineService
          .v1VmwareVirtualMachinesIdDelete({
            id: vm.id,
          })
          .subscribe(data => {
            this.router.navigate(['/vmware']);
          });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(
        `${deleteDescription} Virtual Machine?`,
        `Do you want to ${deleteDescription} virtual machine "${vm.name}"?`,
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
          this.getVirtualMachine();
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

  ngOnInit() {
    this.Id = this.route.snapshot.paramMap.get('id');
    console.log(this.Id);

    this.getVirtualMachine();
  }
}
