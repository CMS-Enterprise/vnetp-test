import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { V1VmwareVirtualMachinesService, VmwareVirtualMachine, VmwareVirtualDisk, VmwareNetworkAdapter } from 'api_client';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { NgxSmartModalService } from 'ngx-smart-modal';
import ConversionUtil from 'src/app/utils/ConversionUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-vmware-detail',
  templateUrl: './vmware-detail.component.html',
  styleUrls: ['./vmware-detail.component.scss'],
})
export class VmwareDetailComponent implements OnInit {
  Id: string;
  VirtualMachine: VmwareVirtualMachine;
  virtualDisks: Array<VmwareVirtualDisk>;
  networkAdapters: Array<VmwareNetworkAdapter>;

  ConversionUtil = ConversionUtil;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private virtualMachineService: V1VmwareVirtualMachinesService,
    private ngx: NgxSmartModalService,
  ) {}

  getVirtualMachine() {
    this.virtualMachineService
      .v1VmwareVirtualMachinesIdGet({
        id: this.Id,
        join: 'virtualDisks,networkAdapters',
      })
      .subscribe(data => {
        this.VirtualMachine = data;
        this.virtualDisks = data.virtualDisks;
        this.networkAdapters = data.networkAdapters;
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
            this.router.navigate(['/vmware'], { queryParamsHandling: 'merge' });
          });
      }
    };

    SubscriptionUtil.subscribeToYesNoModal(
      new YesNoModalDto(`${deleteDescription} Virtual Machine?`, `Do you want to ${deleteDescription} virtual machine "${vm.name}"?`),
      this.ngx,
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

  ngOnInit() {
    this.Id = this.route.snapshot.paramMap.get('id');
    this.getVirtualMachine();
  }
}
