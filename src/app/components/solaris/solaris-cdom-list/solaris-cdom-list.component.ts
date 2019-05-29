import { Component, OnInit } from "@angular/core";
import { AutomationApiService } from "src/app/services/automation-api.service";
import { SolarisCdom, SolarisCdomResponse } from "../../../models/solaris-cdom";
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

  }


  ngOnInit() {

  this.automationApiService.getCDoms()
    .subscribe(data => {
      console.log(data)
      const cdomResponse = data as SolarisCdomResponse;
      this.CDOMDeviceArray = cdomResponse.Devices;
   });
 }


  // getLdoms(Ldoms: string[]) {
//     this.solarisService.ldomFilter = Ldoms;
//     this.router.navigate(["/solaris-ldom-create"]);
//   }
}
