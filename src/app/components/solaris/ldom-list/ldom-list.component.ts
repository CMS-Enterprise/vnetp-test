import { Component, OnInit, Input } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { SolarisLdom } from 'src/app/models/solaris/solaris-ldom';
import { Router } from '@angular/router';

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
    private router: Router
    ) { }

  ngOnInit() {
    this.Ldoms = new Array<SolarisLdom>();
    this.getLdoms();
  }
  deleteLdom(device: SolarisLdom){
   const extra_vars: {[k:string]: any} = {};
   extra_vars.id = device.device_id;
   const body = { extra_vars };
   this.automationApiService.launchTemplate('delete-device', body, true).subscribe();
   this.router.navigate(['/solaris/ldom/list']);
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
}
