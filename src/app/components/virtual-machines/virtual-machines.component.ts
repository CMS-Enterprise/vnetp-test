import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { VirtualMachine } from 'src/app/models/virtual-machine';

@Component({
  selector: 'app-virtual-machines',
  templateUrl: './virtual-machines.component.html',
  styleUrls: ['./virtual-machines.component.css']
})
export class VirtualMachinesComponent implements OnInit {

  constructor(private automationApiService : AutomationApiService) { }

  virtualMachines : Array<VirtualMachine>;

  ngOnInit() {
    this.getVirtualMachines();
  }

  getVirtualMachines() {
    this.automationApiService.getVirtualMachines().subscribe(
      (data: Array<VirtualMachine>) => this.virtualMachines = data,
      error => console.error(error)
      );
  }
}
