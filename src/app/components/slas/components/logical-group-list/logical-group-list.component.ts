import { Component, OnInit } from '@angular/core';
import { V1AgmLogicalGroupsService } from 'api_client';

interface LogicalGroupView {
  id: string;
  name: string;
  slaTemplateName: string;
  slaTemplateDescription: string;
  slaProfileName: string;
  slaProfileDescription: string;
}
@Component({
  selector: 'app-logical-group-list',
  templateUrl: './logical-group-list.component.html',
})
export class LogicalGroupListComponent implements OnInit {
  public config = {
    description: 'List of SLA Logical Groups',
    columns: [
      {
        name: 'Name',
        property: 'name',
      },
      {
        name: 'SLA Template',
        property: 'slaTemplateName',
      },
      {
        name: '',
        property: 'slaTemplateDescription',
      },
      {
        name: 'SLA Profile',
        property: 'slaProfileName',
      },
      {
        name: '',
        property: 'slaProfileDescription',
      },
    ],
  };
  public isLoading = false;
  public logicalGroups: LogicalGroupView[] = [];

  constructor(private agmLogicalGroupService: V1AgmLogicalGroupsService) {}

  ngOnInit(): void {
    this.loadLogicalGroups();
  }

  public loadLogicalGroups(): void {
    this.isLoading = true;
    this.agmLogicalGroupService.v1AgmLogicalGroupsGet().subscribe(logicalGroups => {
      this.logicalGroups = logicalGroups.map(logicalGroup => {
        const { sla } = logicalGroup;
        return {
          id: logicalGroup.id,
          name: logicalGroup.name,
          slaTemplateName: sla.template.name,
          slaTemplateDescription: sla.template.description || '--',
          slaProfileName: sla.profile.name,
          slaProfileDescription: sla.profile.description || '--',
        };
      });
      this.isLoading = false;
    });
  }
}
