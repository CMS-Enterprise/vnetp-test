import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';

@Component({
  selector: 'app-virtual-machines',
  templateUrl: './virtual-machines.component.html',
  styleUrls: ['./virtual-machines.component.css']
})
export class VirtualMachinesComponent implements OnInit {

  constructor(private automationApiService : AutomationApiService) { }

  virtualMachines;

  ngOnInit() {
    this.getVirtualMachines();
  }

  getVirtualMachines() {
    this.automationApiService.getVirtualMachines().subscribe(
      data => {this.virtualMachines = data},
      err => console.error(err)    
      );
  };
}
