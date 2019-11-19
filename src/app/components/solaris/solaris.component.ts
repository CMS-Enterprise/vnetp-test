import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';

@Component({
  selector: 'app-solaris',
  templateUrl: './solaris.component.html',
})
export class SolarisComponent implements OnInit {
  constructor(private automationApiService: AutomationApiService) {}

  CdomCount: number;
  LdomCount: number;

  ngOnInit() {
    this.getCdomCount();
    this.getLdomCount();
  }

  getCdomCount() {
    this.automationApiService.getCDoms().subscribe(data => {
      const result = data as any;
      this.CdomCount = result.total_count || 0;
    });
  }

  getLdomCount() {
    this.automationApiService.getLDoms().subscribe(data => {
      const result = data as any;
      this.LdomCount = result.total_count || 0;
    });
  }
}
