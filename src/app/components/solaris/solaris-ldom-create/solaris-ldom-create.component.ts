import { Component, OnInit } from '@angular/core';
import { SolarisServiceService } from '../solaris-services/solaris-service.service';
import { SolarisCdom } from 'src/app/models/solaris-cdom';

@Component({
  selector: 'app-solaris-ldom-create',
  templateUrl: './solaris-ldom-create.component.html',
  styleUrls: ['./solaris-ldom-create.component.css']
})
export class SolarisLdomCreateComponent implements OnInit {

  ldomFilter: string[];

  constructor(private solarisService: SolarisServiceService) { }

  getLdoms() {

    if (this.ldomFilter) {
    // this.apiService.getLdoms(this.ldomFilter);
    } else if (!this.ldomFilter) {
      // this.apiService.getLdoms();
    }
  }

  ngOnInit() {
    this.ldomFilter = Object.assign([], this.solarisService.ldomFilter as string[]);
    this.getLdoms();
  }
}
