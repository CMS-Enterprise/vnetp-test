import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';

@Component({
  selector: 'app-storage',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.css']
})
export class StorageComponent implements OnInit {

  constructor(private automationApiService : AutomationApiService) { }

  storagePools;

  ngOnInit() {
    this.getStoragePools();
  }

  getStoragePools() {
    this.automationApiService.getStorage().subscribe(
      data => {this.storagePools = data},
      err => console.error(err)    
      );
  };

}
