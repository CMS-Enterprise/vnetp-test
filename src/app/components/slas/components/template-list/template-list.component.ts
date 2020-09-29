import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';

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
  public templates: TemplateDto[] = [];

  // private agmTemplateService: V1AgmTemplatesService,
  constructor() {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  public loadTemplates(): void {
    of([
      {
        id: '1',
        name: 'Template #1',
      },
    ]).subscribe(data => {
      this.templates = data;
    });
  }
}

interface TemplateDto {
  id: string;
  name: string;
}
