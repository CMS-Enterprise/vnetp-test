import { Component, OnInit, Input } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { SolarisLdom } from 'src/app/models/solaris/solaris-ldom';
import { SolarisService } from '../solaris-services/solaris-service.service';
import { Router } from '@angular/router';
import { HelpersService } from 'src/app/services/helpers.service';
import { SolarisCdom } from 'src/app/models/solaris/solaris-cdom';

@Component({
  selector: 'app-ldom-list',
  templateUrl: './ldom-list.component.html',
  styleUrls: ['./ldom-list.component.css']
})
export class LdomListComponent implements OnInit {

  @Input()
  CdomName: string;

  Ldoms: Array<SolarisLdom>;

  constructor(
    private automationApiService: AutomationApiService,
    private solarisService: SolarisService,
    private router: Router,
    private hs: HelpersService
    ) { }

  ngOnInit() {
    this.Ldoms = new Array<SolarisLdom>();
    this.getLdoms();
  }
  getLdoms() {
    if (!this.CdomName) {
      this.automationApiService.getLDoms().subscribe(
        data => {
          const result = data as any;
          this.Ldoms = result.Devices as Array<SolarisLdom>;
        }
      );
  } else if (this.CdomName) {
    this.automationApiService.getLDomsForCDom(this.CdomName).subscribe(
      data => {
        const result = data as any;
        this.Ldoms = result.Devices as Array<SolarisLdom>;
      });
     }
    }
  editLdom(device: SolarisLdom){
    this.automationApiService.getDevicesbyID(device.device_id).subscribe(dataLdom => {
      const resultLdom = dataLdom as SolarisLdom;
      this.solarisService.currentLdom = this.hs.getJsonCustomField(resultLdom, 'Metadata') as SolarisLdom;
      this.solarisService.parentCdom = this.solarisService.currentLdom.associatedcdom;
      this.router.navigate(['/solaris/ldom/create']);
    });
  }
}
