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

  }


  ngOnInit() {
  //  this.solarisService.loadDevices().then((data: any) => {
  //   this.returnDevices = data;
  //   console.log('Test', this.returnDevices);
  //   });

  this.automationApiService
  .doqlQuery(
    "SELECT * FROM view_device_custom_fields_flat_v1 cust LEFT JOIN view_device_v1 std ON std.device_pk = cust.device_fk"
  )
  .subscribe(data => {
    this.returnDevices = this.solarisService.loadDevices(data);
    console.log('Component',this.returnDevices);
    this.returnDevices.forEach((obj) => {
     if(obj.key === "CDOM"){
       this.CDOMDeviceArray = obj.value
     }
    });
    //  this.CDOMDeviceArray = this.returnDevices[0].value;
  });

  // console.log(this.solarisService.returnUnique([1,2,3,4,"any","any"])); 
 }

  getLdoms(Ldoms: string[]) {
    this.solarisService.ldomFilter = Ldoms;
    this.router.navigate(["/solaris-ldom-create"]);
  }
}
