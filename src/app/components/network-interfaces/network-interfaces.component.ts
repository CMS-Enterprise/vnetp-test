import { Component, OnInit } from '@angular/core';
import { LogicalInterface } from 'src/app/models/network/logical-interface';
import { PhysicalInterface } from 'src/app/models/network/physical-interface';
import { Subnet, SubnetResponse } from 'src/app/models/d42/subnet';
import { NetworkInterfacesDto } from 'src/app/models/network/network-interfaces-dto';
import { HelpersService } from 'src/app/services/helpers.service';
import { Vrf } from 'src/app/models/d42/vrf';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { ModalMode } from 'src/app/models/modal-mode';
import { Subscription } from 'rxjs';
import { LogicalInterfaceModalDto } from 'src/app/models/logical-interface-modal-dto';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';

@Component({
  selector: 'app-network-interfaces',
  templateUrl: './network-interfaces.component.html',
  styleUrls: ['./network-interfaces.component.css']
})
export class NetworkInterfacesComponent implements OnInit {

  constructor(private hs: HelpersService, private api: AutomationApiService,
              private ngx: NgxSmartModalService) { }

  LogicalInterfaces: Array<LogicalInterface>;
  PhysicalInterfaces: Array<PhysicalInterface>;
  Subnets: Array<Subnet>;
  vrfs: Array<Vrf>;
  currentVrf: Vrf;
  dirty: boolean;
  navIndex = 0;

  editLogicalInterfaceIndex: number;
  editLogicalInterfaceModalMode: ModalMode;
  logicalInterfaceModalSubscription: Subscription;


  getVrfs() {
    this.dirty = false;

    let vrfId: number = null;

    if (this.currentVrf) {
      vrfId = this.currentVrf.id;
    }

    this.api.getVrfs().subscribe(data => {
      this.vrfs = data;

      if (!vrfId) {
        this.currentVrf = this.vrfs[0];
      } else {
        this.currentVrf = this.vrfs.find(v => v.id === vrfId);

        if (!this.currentVrf) {
          this.currentVrf = this.vrfs[0];
        }
      }
      this.getVrfObjects(this.currentVrf);
    });
  }

  getVrfObjects(vrf: Vrf) {
      const networkInterfacesDto = this.hs.getJsonCustomField(vrf, 'network_interfaces') as NetworkInterfacesDto;

      if (!networkInterfacesDto) {
        this.LogicalInterfaces = new Array<LogicalInterface>();
        this.PhysicalInterfaces = new Array<PhysicalInterface>();
       } else if (networkInterfacesDto) {
        this.LogicalInterfaces = networkInterfacesDto.LogicalInterfaces;
        this.PhysicalInterfaces = networkInterfacesDto.PhysicalInterfaces;
      }
      this.getVrfSubnets(vrf);
  }

  getVrfSubnets(vrf: Vrf) {
    this.api.getSubnets(vrf.id).subscribe(data => {
      const result = data as SubnetResponse;
      this.Subnets = result.subnets;
    });
  }

  createLogicalInterface() {
    this.subscribeToLogicalInterfaceModal();
    const dto = new LogicalInterfaceModalDto();
    dto.PhysicalInterfaces = new Array<PhysicalInterface>();

    // Get only unused Physical Interfaces.
    this.PhysicalInterfaces.forEach(int => {
      if (!int.LogicalInterfaceName) {
        dto.PhysicalInterfaces.push(int);
      }
    });

    dto.Subnets = this.Subnets;

    this.ngx.setModalData(this.hs.deepCopy(dto), 'logicalInterfaceModal');
    this.editLogicalInterfaceModalMode = ModalMode.Create;
    this.ngx.getModal('logicalInterfaceModal').open();
  }

  editLogicalInterface(logicalInterface: LogicalInterface) {
    this.subscribeToLogicalInterfaceModal();
    this.editLogicalInterfaceIndex = this.LogicalInterfaces.indexOf(logicalInterface);
    const dto = new LogicalInterfaceModalDto();

    dto.LogicalInterface = logicalInterface;
    dto.PhysicalInterfaces = new Array<PhysicalInterface>();

    // Get only unused Physical Interfaces.
    this.PhysicalInterfaces.forEach(int => {
      if (logicalInterface.Name === int.LogicalInterfaceName || !int.LogicalInterfaceName) {
        dto.PhysicalInterfaces.push(int);
      }
    });

    dto.Subnets = this.Subnets;

    this.ngx.setModalData(this.hs.deepCopy(dto), 'logicalInterfaceModal');
    this.editLogicalInterfaceModalMode = ModalMode.Edit;
    this.ngx.getModal('logicalInterfaceModal').open();
  }

  subscribeToLogicalInterfaceModal() {
    this.logicalInterfaceModalSubscription =
    this.ngx.getModal('logicalInterfaceModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent ) => {
      const data = modal.getData() as LogicalInterfaceModalDto;

      if (data && data.LogicalInterface)  {
        this.saveLogicalInterface(data.LogicalInterface);
      }
      this.ngx.resetModalData('logicalInterfaceModal');
      this.logicalInterfaceModalSubscription.unsubscribe();
    });
  }

  saveLogicalInterface(logicalInterface: LogicalInterface) {
    if (this.editLogicalInterfaceModalMode === ModalMode.Create) {
      this.LogicalInterfaces.push(logicalInterface);
    } else {
      this.LogicalInterfaces[this.editLogicalInterfaceIndex] = logicalInterface;
    }

    logicalInterface.PhysicalInterfaces.forEach(name => {
      const physicalInterface = this.PhysicalInterfaces.find(p => p.Name === name);

      if (physicalInterface) {
        physicalInterface.LogicalInterfaceName = logicalInterface.Name;
      }
    });

    this.dirty = true;
  }

  deleteLogicalInterface(logicalInterface: LogicalInterface) {
    const index = this.LogicalInterfaces.indexOf(logicalInterface);
    if (index > -1) {

      this.PhysicalInterfaces.forEach(p => {
        if (p.LogicalInterfaceName === logicalInterface.Name) {
          p.LogicalInterfaceName = '';
        }
      });

      this.LogicalInterfaces.splice(index, 1);
      this.dirty = true;
    }
  }

  saveAll() {
    this.dirty = false;
    const dto = new NetworkInterfacesDto();

    dto.LogicalInterfaces = this.LogicalInterfaces;
    dto.PhysicalInterfaces = this.PhysicalInterfaces;
    dto.VrfId = this.currentVrf.id;

    let extra_vars: {[k: string]: any} = {};
    extra_vars.network_interfaces_dto = dto;
    extra_vars.vrf_name = this.currentVrf.name.split('-')[1];

    // TODO: Handle Deletes.

    const body = { extra_vars };

    this.api.launchTemplate('save-network-interfaces-dto', body).subscribe(data => {
      // TODO: Provide to message service
     });
  }

  ngOnInit() {
    this.getVrfs();
  }

  insertLogicalInterfaces(logicalIntefaces) {
    if (!this.LogicalInterfaces) { this.LogicalInterfaces = new Array<LogicalInterface>(); }
    logicalIntefaces.forEach(logicalInterface => {
      this.LogicalInterfaces.push(logicalInterface);
    })
  }
}
