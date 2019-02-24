import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { VirtualMachine } from 'src/app/models/virtual-machine';

@Component({
  selector: 'app-virtual-machine-detail',
  templateUrl: './virtual-machine-detail.component.html',
  styleUrls: ['./virtual-machine-detail.component.css']
})
export class VirtualMachineDetailComponent implements OnInit {

  constructor(private route: ActivatedRoute, private automationApiService: AutomationApiService) { }

  Id = '';
  virtualMachine = new VirtualMachine();

  ngOnInit() {
    this.Id += this.route.snapshot.paramMap.get('id');

    this.getVirtualMachine();
  }

  getVirtualMachine() {
    this.automationApiService.getVirtualMachine(this.Id).subscribe(
      (data: VirtualMachine) => this.virtualMachine = data,
      error => console.error(error)
    );
  }
}
