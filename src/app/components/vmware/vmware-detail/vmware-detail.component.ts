import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { V1VmwareVirtualMachinesService, VmwareVirtualMachine, VmwareVirtualDisk, VmwareNetworkAdapter } from 'api_client';
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

  public deleteVirtualMachine(vm: VmwareVirtualMachine): void {
    this.entityService.deleteEntity(vm, {
      entityName: 'Virtual Machine',
      delete$: this.virtualMachineService.v1VmwareVirtualMachinesIdDelete({
        id: vm.id,
      }),
      softDelete$: this.virtualMachineService.v1VmwareVirtualMachinesIdSoftDelete({
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
        .v1VmwareVirtualMachinesIdRestorePatch({
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
