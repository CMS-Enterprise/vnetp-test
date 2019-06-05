import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { HelpersService } from 'src/app/services/helpers.service';
import { SolarisLdom } from 'src/app/models/solaris/solaris-ldom';

@Component({
  selector: 'app-ldom-detail',
  templateUrl: './ldom-detail.component.html',
  styleUrls: ['./ldom-detail.component.css']
})
export class LdomDetailComponent implements OnInit {
  Ldom: SolarisLdom;
  LdomMetadata: SolarisLdom;
  Id: string;

  constructor(private route: ActivatedRoute, private automationApiService: AutomationApiService, private hs: HelpersService) { }

  ngOnInit() {
    this.Id = this.route.snapshot.paramMap.get('id');
    this.getLdom();
  }

  getLdom() {
    this.automationApiService.getDevicesbyID(this.Id).subscribe(
      data => {
        this.Ldom = data as SolarisLdom;
        this.LdomMetadata = this.hs.getJsonCustomField(this.Ldom, 'Metadata') as SolarisLdom;

        console.log(this.LdomMetadata);
      }
    )
  }

}
