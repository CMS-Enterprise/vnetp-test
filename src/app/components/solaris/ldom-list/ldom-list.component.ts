import { Component, OnInit, Input } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { SolarisLdom } from 'src/app/models/solaris/solaris-ldom';

@Component({
  selector: 'app-ldom-list',
  templateUrl: './ldom-list.component.html',
  styleUrls: ['./ldom-list.component.css']
})
export class LdomListComponent implements OnInit {

  @Input()
  CdomName: string;

  Ldoms: Array<SolarisLdom>;

  constructor(private automationApiService: AutomationApiService) { }

  ngOnInit() {
    this.Ldoms = new Array<SolarisLdom>();
    this.getLdoms();
  }

  getLdoms() {
    if (!this.CdomName) {
      this.automationApiService.getLDoms().subscribe(
        data => {
          this.Ldoms = data as Array<SolarisLdom>;
        }
      );
  } else if (this.CdomName) {
    this.automationApiService.getLDomsForCDom(this.CdomName).subscribe(
      data => {
        this.Ldoms = data as Array<SolarisLdom>;
      });
     }
    }
}
