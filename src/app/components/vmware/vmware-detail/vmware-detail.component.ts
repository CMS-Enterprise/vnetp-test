import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { V1VmwareVirtualMachinesService, VmwareVirtualMachine, VmwareVirtualDisk, VmwareNetworkAdapter } from 'client';
import ConversionUtil from 'src/app/utils/ConversionUtil';
import { EntityService } from 'src/app/services/entity.service';

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
    private entityService: EntityService,
    private route: ActivatedRoute,
    private router: Router,
    private virtualMachineService: V1VmwareVirtualMachinesService,
  ) {}

  getVirtualMachine() {
    this.virtualMachineService
      .getOneVmwareVirtualMachine({
        id: this.Id,
        join: ['virtualDisks,networkAdapters'],
      })
      .subscribe(data => {
        this.VirtualMachine = data;
        this.virtualDisks = data.virtualDisks;
        this.networkAdapters = data.networkAdapters;
      });
  }

  public deleteVirtualMachine(vm: VmwareVirtualMachine): void {
    this.entityService.deleteEntity(vm, {
      entityName: 'Virtual Machine',
      delete$: this.virtualMachineService.deleteOneVmwareVirtualMachine({
        id: vm.id,
      }),
      softDelete$: this.virtualMachineService.softDeleteOneVmwareVirtualMachine({
        id: vm.id,
      }),
      onSuccess: () => {
        if (vm.deletedAt) {
          this.router.navigate(['/vmware'], { queryParamsHandling: 'merge' });
        } else {
          this.getVirtualMachine();
        }
      },
    });
  }

  restoreVirtualMachine(vm: VmwareVirtualMachine) {
    if (vm.deletedAt) {
      this.virtualMachineService
        .restoreOneVmwareVirtualMachine({
          id: vm.id,
        })
        .subscribe(() => {
          this.getVirtualMachine();
        });
    }
  }

  ngOnInit() {
    this.Id = this.route.snapshot.paramMap.get('id');
    this.getVirtualMachine();
  }
}
