import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActifioDetailedLogicalGroupDto, ActifioLogicalGroupDto, V1ActifioGmLogicalGroupsService } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { Observable, of, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TableConfig } from 'src/app/common/table/table.component';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

interface LogicalGroupView {
  id: string;
  name: string;
  description: string;
  slaTemplateName: string;
  slaProfileName: string;
  detailedLogicalGroup: Observable<ActifioDetailedLogicalGroupDto>;
}

@Component({
  selector: 'app-logical-group-list',
  templateUrl: './logical-group-list.component.html',
})
export class LogicalGroupListComponent implements OnInit, OnDestroy {
  @ViewChild('detailsTemplate') detailsTemplate: TemplateRef<any>;
  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public config: TableConfig<LogicalGroupView> = {
    description: 'List of SLA Logical Groups',
    columns: [
      {
        name: 'Name',
        property: 'name',
      },
      {
        name: 'Description',
        property: 'description',
      },
      {
        name: 'SLA Template',
        property: 'slaTemplateName',
      },
      {
        name: 'SLA Profile',
        property: 'slaProfileName',
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

  private cachedLogicalGroups = new Map<string, ActifioDetailedLogicalGroupDto>();
  private createSubscription: Subscription;

  constructor(
    private agmLogicalGroupService: V1ActifioGmLogicalGroupsService,
    private ngx: NgxSmartModalService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.loadLogicalGroups();
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.createSubscription]);
  }

  public loadLogicalGroups(reloadCache = false): void {
    if (reloadCache) {
      this.cachedLogicalGroups = new Map();
    }
    this.isLoading = true;
    this.agmLogicalGroupService.v1ActifioGmLogicalGroupsGet({}).subscribe(logicalGroups => {
      this.logicalGroups = logicalGroups.map(logicalGroup => {
        const { id, name, description = '--', sla } = logicalGroup;
        const template = sla ? sla.template : { name: '--', description: '--' };
        const profile = sla ? sla.profile : { name: '--', description: '--' };

        return {
          description,
          id,
          name,
          slaTemplateName: template.name,
          slaProfileName: profile.name,
          detailedLogicalGroup: this.loadDetailedLogicalGroup(id),
        };
      });
      this.isLoading = false;
    });
  }

  public loadDetailedLogicalGroup(logicalGroupId: string): Observable<ActifioDetailedLogicalGroupDto> {
    const isCached = this.cachedLogicalGroups.has(logicalGroupId);
    if (isCached) {
      return of(this.cachedLogicalGroups.get(logicalGroupId));
    }
    return this.agmLogicalGroupService.v1ActifioGmLogicalGroupsIdGet({ id: logicalGroupId }).pipe(
      tap((logicalGroup: ActifioDetailedLogicalGroupDto) => {
        this.cachedLogicalGroups.set(logicalGroupId, logicalGroup);
      }),
    );
  }

  public deleteLogicalGroup(logicalGroup: ActifioLogicalGroupDto): void {
    const { id, name } = logicalGroup;
    const dto = new YesNoModalDto(
      'Delete Logical Group',
      `Do you want to delete logical group "${name}"?`,
      'Delete Logical Group',
      'Cancel',
      'danger',
    );
    const deleteFunction = () => {
      this.agmLogicalGroupService.v1ActifioGmLogicalGroupsIdDelete({ id }).subscribe(() => {
        this.loadLogicalGroups();
        this.toastr.success(name, 'Successfully deleted');
      });
    };

    SubscriptionUtil.subscribeToYesNoModal(dto, this.ngx, deleteFunction);
  }

  public openLogicalGroupModal(logicalGroupId?: string): void {
    this.ngx.setModalData({ id: logicalGroupId }, 'logicalGroupModal');
    this.ngx.getModal('logicalGroupModal').open();

    this.createSubscription = this.ngx.getModal('logicalGroupModal').onAnyCloseEvent.subscribe(() => {
      this.loadLogicalGroups(true);
    });
  }

  public openDetailedModal(detailedLogicalGroup: ActifioDetailedLogicalGroupDto): void {
    this.selectedLogicalGroup = detailedLogicalGroup;
    this.ngx.getModal('logicalGroupViewModal').open();
  }
}
