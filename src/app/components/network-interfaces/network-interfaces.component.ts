import { Component, OnInit } from '@angular/core';
import { LogicalInterface } from 'src/app/models/network/logical-interface';
import { PhysicalInterface } from 'src/app/models/network/physical-interface';
import { Subnet, SubnetResponse } from 'src/app/models/d42/subnet';
import { NetworkInterfacesDto } from 'src/app/models/network/network-interfaces-dto';
import { HelpersService } from 'src/app/services/helpers.service';
import { Vrf } from 'src/app/models/d42/vrf';
import { AutomationApiService } from 'src/app/services/automation-api.service';

@Component({
  selector: 'app-network-interfaces',
  templateUrl: './network-interfaces.component.html',
  styleUrls: ['./network-interfaces.component.css']
})
export class NetworkInterfacesComponent implements OnInit {

  constructor(private hs: HelpersService, private api: AutomationApiService) { }

  LogicalInterfaces: Array<LogicalInterface>;
  PhysicalInterfaces: Array<PhysicalInterface>;
  Subnets: Array<Subnet>;
  vrfs: Array<Vrf>;
  currentVrf: Vrf;
  dirty: boolean;
  navIndex = 0;

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

  ngOnInit() {
    this.getVrfs();
  }



}
