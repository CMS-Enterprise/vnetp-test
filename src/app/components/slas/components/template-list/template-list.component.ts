import { Component, OnInit } from '@angular/core';
import { ActifioTemplateDto, V1AgmTemplatesService } from 'api_client';

@Component({
  selector: 'app-template-list',
  templateUrl: './template-list.component.html',
})
export class TemplateListComponent implements OnInit {
  public config = {
    description: 'List of SLA Templates',
    columns: [
      {
        name: 'Name',
        property: 'name',
      },
    ],
  };
  public isLoading = false;
  public templates: ActifioTemplateDto[] = [];

  constructor(private agmTemplateService: V1AgmTemplatesService) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  public loadTemplates(): void {
    this.isLoading = true;
    this.agmTemplateService.v1AgmTemplatesGet().subscribe(data => {
      this.templates = data;
      this.isLoading = false;
    });
  }
}
