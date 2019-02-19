import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AutomationApiService } from 'src/app/services/automation-api.service';

@Component({
  selector: 'app-virtual-machine-detail',
  templateUrl: './virtual-machine-detail.component.html',
  styleUrls: ['./virtual-machine-detail.component.css']
})
export class VirtualMachineDetailComponent implements OnInit {

  constructor(private route: ActivatedRoute, private automationApiService: AutomationApiService) { }

  Id = "";
  virtualMachine;
  
  ngOnInit() {
    this.Id += this.route.snapshot.paramMap.get("id")

    this.getVirtualMachine();
  }

  getVirtualMachine(){
    this.automationApiService.getVirtualMachine(this.Id).subscribe(
      data => {this.virtualMachine = data},
      err => console.error(err),
      () => console.log('done loading vm')
    );
  }

}
