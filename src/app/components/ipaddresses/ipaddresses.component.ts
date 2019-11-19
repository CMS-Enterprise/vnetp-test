import { Component, OnInit, Input } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';

@Component({
  selector: 'app-ipaddresses',
  templateUrl: './ipaddresses.component.html',
})
export class IpaddressesComponent implements OnInit {
  @Input()
  subnetId: number;

  @Input()
  showTitle: true;

  // TODO: Create datatype for IP.
  ipResult: any;

  constructor(private automationApiService: AutomationApiService) {}

  ngOnInit() {
    this.getIps();
  }

  getIps() {
    if (!this.subnetId) {
      this.automationApiService.getIps().subscribe(
        data => {
          this.ipResult = data;
        },
        error => {
          console.log(error);
        },
      );
    } else if (this.subnetId) {
      this.automationApiService.getSubnetIps(this.subnetId).subscribe(
        data => {
          this.ipResult = data;
        },
        error => {
          console.log(error);
        },
      );
    }
  }
}
