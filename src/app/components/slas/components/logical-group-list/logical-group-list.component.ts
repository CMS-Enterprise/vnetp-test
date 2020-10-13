import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActifioDetailedLogicalGroupDto, V1AgmLogicalGroupsService } from 'api_client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface LogicalGroupView {
  id: string;
  name: string;
  slaTemplateName: string;
  slaTemplateDescription: string;
  slaProfileName: string;
  slaProfileDescription: string;
  memberCount: Observable<number>;
}
@Component({
  selector: 'app-logical-group-list',
  templateUrl: './logical-group-list.component.html',
})
export class LogicalGroupListComponent implements OnInit {
  @ViewChild('memberTemplate', { static: false }) memberTemplate: TemplateRef<any>;

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
      {
        name: 'Virtual Machines',
        template: () => this.memberTemplate,
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
          memberCount: this.getMemberCount(logicalGroup.id),
        };
      });
      this.isLoading = false;
    });
  }

  private getMemberCount(logicalGroupId: string): Observable<number> {
    return this.agmLogicalGroupService
      .v1AgmLogicalGroupsIdGet({ id: logicalGroupId })
      .pipe(map((detailedLogicalGroup: ActifioDetailedLogicalGroupDto) => detailedLogicalGroup.members.length));
  }
}
