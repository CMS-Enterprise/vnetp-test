import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { VirtualAction } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-virtual-machine',
  templateUrl: './create-virtual-machine.component.html',
  styleUrls: ['./create-virtual-machine.component.css']
})
export class CreateVirtualMachineComponent implements OnInit {

  constructor(private automationApiService : AutomationApiService, private router : Router) { }

  templates;
  projects;
  networks;
  storagePools;

  selectionIndex: number = 1;

  selectedProject;
  selectedNetwork;

  virtualMachine;

  updateSelectionIndex(index: number){
    this.selectionIndex = index;
  };

  selectProject(){
    this.updateSelectionIndex(2);
  }

  selectTemplate(template){
    this.virtualMachine.Name = template.Name;
    this.virtualMachine.Description = template.Description;
    this.virtualMachine.TemplateId = template.Id;

    this.virtualMachine.CpuCores = template.CpuCores;
    this.virtualMachine.CoresPerSocket = template.CoresPerSocket;
    this.virtualMachine.MemoryMB = template.MemoryMB;

    // Add an OS Disk to the VM
    this.virtualMachine.AddVirtualDisk(template.OsDiskSizeGB, "OS Disk", true);

    // Add a Network Adapter to the VM
    this.virtualMachine.AddNetworkAdapter("Default");

    this.updateSelectionIndex(3);
  };

  // createVirtualMachine(){
  //   this.automationApiService.createVirtualMachine(this.virtualMachine).subscribe(
  //     data => {},
  //     err => console.error(err),
  //     () => this.router.navigate(["/virtual-machines"])
  //   )
  // };

  ngOnInit() {
    this.getProjects();
    this.getTemplates();
    this.getNetworks();
  }

  getTemplates(){
    this.automationApiService.getTemplates().subscribe(
      data => {this.templates = data},
      err => console.error(err)
    );
  };

  getNetworks(){
    this.automationApiService.getNetworks().subscribe(
      data => {this.networks = data},
      err => console.error(err)
    );
  };

  getProjects(){
    this.automationApiService.getProjects().subscribe(
      data => {this.projects = data},
      err => console.error(err)
    );
  };

  //TODO: Move to Helper Service
  isEmptyObject(obj) {
    return (obj && (Object.keys(obj).length === 0));
  }

}
