import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  V1VmwareNetworkAdapterService,
  VmwareNetworkAdapter,
  Vlan,
  V1TiersService,
} from 'api_client';
import { VirtualMachineModalDto } from 'src/app/models/vmware/virtual-machine-modal-dto';

@Component({
  selector: 'app-network-adapter-modal',
  templateUrl: './network-adapter-modal.component.html',
  styleUrls: ['./network-adapter-modal.component.css'],
})
export class NetworkAdapterModalComponent implements OnInit {
  form: FormGroup;
  VirtualMachineId: string;
  Vlans: Array<Vlan>;
  DatacenterId: string;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private networkAdapterService: V1VmwareNetworkAdapterService,
    private tierService: V1TiersService,
  ) {}

  getVlanList() {
    this.tierService
      .v1DatacentersDatacenterIdTiersGet({
        datacenterId: this.DatacenterId,
        join: 'vlans',
      })
      .subscribe(data => console.log(data));
  }

  save() {
    if (this.form.invalid) {
      return;
    }

    const networkAdapter = {} as VmwareNetworkAdapter;
    networkAdapter.name = this.form.value.name;
    networkAdapter.description = this.form.value.description;
    networkAdapter.vlanId = this.form.value.vlanId;
    networkAdapter.virtualMachineId = this.VirtualMachineId;

    this.ngx.resetModalData('networkAdapterModal');
    this.ngx.setModalData(
      Object.assign({}, networkAdapter),
      'networkAdapterModal',
    );

    this.networkAdapterService
      .v1VmwareNetworkAdapterPost({
        vmwareNetworkAdapter: networkAdapter,
      })
      .subscribe(
        data => {
          this.closeModal();
        },
        error => {},
      );
  }

  getData() {
    const dto = Object.assign(
      {},
      this.ngx.getModalData('networkAdapterModal') as VirtualMachineModalDto,
    );
    this.VirtualMachineId = dto.VirtualMachineId;
    this.DatacenterId = dto.DatacenterId;
    this.getVlanList();
  }

  cancel() {
    this.closeModal();
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: [''],
      description: [''],
      vlanId: [''],
    });
  }

  private closeModal() {
    this.ngx.close('networkAdapterModal');
    this.reset();
  }

  private reset() {
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }
}
