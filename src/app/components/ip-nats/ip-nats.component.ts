import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';

@Component({
  selector: 'app-ip-nats',
  templateUrl: './ip-nats.component.html',
  styleUrls: ['./ip-nats.component.css']
})
export class IpNatsComponent implements OnInit {
  ipnats: any;

  constructor(private automationApiService: AutomationApiService) {
    this.ipnats = [];
  }

  ngOnInit() {
    this.getIpNats();
  }

  getIpNats() {
    this.automationApiService.getIpNats().subscribe(
      data => this.ipnats = data
    );
  }
}
