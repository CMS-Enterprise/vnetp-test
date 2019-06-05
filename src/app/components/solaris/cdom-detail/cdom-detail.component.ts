import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SolarisCdom } from 'src/app/models/solaris/solaris-cdom';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { HelpersService } from 'src/app/services/helpers.service';
import { SolarisLdom } from 'src/app/models/solaris/solaris-ldom';

@Component({
  selector: 'app-cdom-detail',
  templateUrl: './cdom-detail.component.html',
  styleUrls: ['./cdom-detail.component.css']
})
export class CdomDetailComponent implements OnInit {
  Id: string;

  Cdom: SolarisCdom;
  CdomMetadata: SolarisCdom;
  Ldoms: Array<SolarisLdom>;

  navIndex = 0;

  constructor(private route: ActivatedRoute, private automationApiService: AutomationApiService, private hs: HelpersService) { }

  ngOnInit() {
    this.Id = this.route.snapshot.paramMap.get('id');
    this.getCdom();
  }

  getCdom() {
    this.automationApiService.getDevicesbyID(this.Id).subscribe(
      data => {
        this.Cdom = data as SolarisCdom;
        this.CdomMetadata = this.hs.getJsonCustomField(this.Cdom, 'Metadata');

        console.log(this.Cdom);
        console.log(this.CdomMetadata);
        this.getLdoms();
      }
    );

  }

  getLdoms() {
    this.automationApiService.getLDomsForCDom(this.Cdom.name).subscribe(
      data => {
        this.Ldoms = data as Array<SolarisLdom>;

        console.log(this.Ldoms);
      }
    )
  }

}
