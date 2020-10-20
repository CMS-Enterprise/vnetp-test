import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActifioDetailedLogicalGroupDto, ActifioLogicalGroupDto, V1AgmLogicalGroupsService } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Observable } from 'rxjs';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

interface LogicalGroupView {
  id: string;
  name: string;
  slaTemplateName: string;
  slaTemplateDescription: string;
  slaProfileName: string;
  slaProfileDescription: string;
  detailedLogicalGroup: Observable<ActifioDetailedLogicalGroupDto>;
}

@Component({
  selector: 'app-logical-group-list',
  templateUrl: './logical-group-list.component.html',
})
export class LogicalGroupListComponent implements OnInit {
  @ViewChild('detailsTemplate', { static: false }) detailsTemplate: TemplateRef<any>;
  @ViewChild('actionsTemplate', { static: false }) actionsTemplate: TemplateRef<any>;

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
        template: () => this.detailsTemplate,
      },
      {
        name: '',
        template: () => this.actionsTemplate,
      },
    ],
  };
  public isLoading = false;
  public logicalGroups: LogicalGroupView[] = [];
  public selectedLogicalGroup: ActifioDetailedLogicalGroupDto;

  constructor(private agmLogicalGroupService: V1AgmLogicalGroupsService, private ngx: NgxSmartModalService) {}

  ngOnInit(): void {
    this.loadLogicalGroups();
  }

  public loadLogicalGroups(): void {
    this.isLoading = true;
    this.agmLogicalGroupService.v1AgmLogicalGroupsGet().subscribe(logicalGroups => {
      this.logicalGroups = logicalGroups.map(logicalGroup => {
        const { id, name, sla } = logicalGroup;
        const template = sla ? sla.template : { name: '--', description: '--' };
        const profile = sla ? sla.profile : { name: '--', description: '--' };

        return {
          id,
          name,
          slaTemplateName: template.name,
          slaTemplateDescription: template.description || '--',
          slaProfileName: profile.name,
          slaProfileDescription: profile.description || '--',
          detailedLogicalGroup: this.loadDetailedLogicalGroup(id),
        };
      });
      this.isLoading = false;
    });
  }

  public loadDetailedLogicalGroup(logicalGroupId: string): Observable<ActifioDetailedLogicalGroupDto> {
    return this.agmLogicalGroupService.v1AgmLogicalGroupsIdGet({ id: logicalGroupId });
  }

  public deleteLogicalGroup(logicalGroup: ActifioLogicalGroupDto): void {
    const { id, name } = logicalGroup;
    const dto = new YesNoModalDto('Delete Logical Group?', `Do you want to delete logical group "${name}"?`);
    const deleteFunction = () => {
      this.agmLogicalGroupService.v1AgmLogicalGroupsIdDelete({ id }).subscribe(() => this.loadLogicalGroups());
    };

    SubscriptionUtil.subscribeToYesNoModal(dto, this.ngx, deleteFunction);
  }

  public openLogicalGroupModal(logicalGroupId?: string): void {
    this.ngx.setModalData({ id: logicalGroupId }, 'logicalGroupModal');
    this.ngx.getModal('logicalGroupModal').open();
  }

  public openDetailedModal(detailedLogicalGroup: ActifioDetailedLogicalGroupDto): void {
    this.selectedLogicalGroup = detailedLogicalGroup;
    this.ngx.getModal('logicalGroupViewModal').open();
  }
}
