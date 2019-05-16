import { Component, OnInit } from "@angular/core";
import { AutomationApiService } from "src/app/services/automation-api.service";
import { SolarisCdom } from "../../../models/solaris-cdom";
import { SolarisLdom } from "../../../models/solaris-ldom";
import { SolarisServiceService } from "../solaris-services/solaris-service.service";
import { Router } from "@angular/router";
@Component({
  selector: "app-solaris-cdom-list",
  templateUrl: "./solaris-cdom-list.component.html",
  styleUrls: ["./solaris-cdom-list.component.css"]
})
export class SolarisCdomListComponent implements OnInit {
  devices: Array<any>;
  returnDevices: Array<any>;
  returnLDOMs: Array<any>;
  CDOMDeviceArray: Array<any>;
  constructor(
    private automationApiService: AutomationApiService,
    private solarisService: SolarisServiceService,
    private router: Router
  ) {
    this.devices = new Array<any>();
    this.returnDevices = new Array<any>();
  }
  ngOnInit() {
    this.loadDevices();
  }
  loadDevices() {
    const CDOMDevice = new SolarisCdom();
    const LDOMDevice = new SolarisLdom();
    this.automationApiService
      .doqlQuery(
        "SELECT * FROM view_device_custom_fields_flat_v1 cust LEFT JOIN view_device_v1 std ON std.device_pk = cust.device_fk"
      )
      .subscribe(data => {
        let result = data as any;
        this.devices = result;
        for (let i = this.devices.length - 1; i >= 0; --i) {
          if (this.devices[i].DeviceType == "solaris_cdom") {
            const currentDevice = this.solarisService.getCDOMDevice(
              this.devices[i]
            );
            this.returnDevices.push(currentDevice);
          } else if (this.devices[i].DeviceType == "solaris_ldom") {
            let currentDevice = this.solarisService.getLDOMDevice(
              this.devices[i]
            );
          }
        }
        console.log(this.devices[0]);
        this.devices = this.returnDevices;
      });
  }

  getLdoms(Ldoms: string[]) {
    this.solarisService.ldomFilter = Ldoms;
    this.router.navigate(["/solaris-ldom-create"]);
  }
}
