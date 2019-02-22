import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  constructor(private automationApiService : AutomationApiService) { }

  projects;

  ngOnInit() {
    this.getProjects();
  }

  getProjects(){
    this.automationApiService.getProjects().subscribe(
      data => {this.projects = data},
      err => console.error(err)         
      );  
    };
}