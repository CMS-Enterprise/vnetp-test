import { Component, OnInit } from "@angular/core";
import { AutomationApiService } from "src/app/services/automation-api.service";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule } from "@angular/common/http";
import { SolarisCdom } from "../../../models/solaris-cdom";
@Component({
  selector: "app-solaris-cdom-list",
  templateUrl: "./solaris-cdom-list.component.html",
  styleUrls: ["./solaris-cdom-list.component.css"]
})
export class SolarisCdomListComponent implements OnInit {
  devices: Array<any>;

  constructor(private automationApiService: AutomationApiService) {
    this.devices = new Array<any>();
  }
  ngOnInit() {
    this.loadDevices();
  }

  loadDevices() {
    //this.automationApiService.doqlQuery('SELECT *FROM view_device_custom_fields_v1').subscribe(data => {console.log(data)});
    this.automationApiService
      .doqlQuery(
        "SELECT * FROM view_device_custom_fields_flat_v1 cust LEFT JOIN view_device_v1 std ON std.device_pk = cust.device_fk"
      )
      .subscribe(data => {
        let result = data as any;
        this.devices = result;
        this.devices = this.devices.filter(obj => obj.DeviceType !== 'solaris_cdom' );
 //       this.devices.forEach(element => {
        for(let i = this.devices.length - 1; i >= 0 ; --i){
          console.log(this.devices[i].DeviceType);
          if(this.devices[i].DeviceType != 'solaris_cdom'){
            this.devices.splice(i,1);
          }
          let jsonStr: string = this.devices[i].Metadata;
          jsonStr = jsonStr.replace(/\\n/g, " ");
          this.devices[i].Metadata = JSON.parse(jsonStr);
        }
 //       });
      });
  }
}
