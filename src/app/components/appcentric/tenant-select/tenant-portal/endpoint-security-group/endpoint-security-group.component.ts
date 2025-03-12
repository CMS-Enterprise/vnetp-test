import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import {
  GetManyEndpointSecurityGroupResponseDto,
  V2AppCentricEndpointSecurityGroupsService,
  V2AppCentricApplicationProfilesService,
  EndpointSecurityGroup,
  V2AppCentricVrfsService,
  GetManyVrfResponseDto,
  GetManyApplicationProfileResponseDto,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { AdvancedSearchAdapter } from 'src/app/common/advanced-search/advanced-search.adapter';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-endpoint-security-group',
  templateUrl: './endpoint-security-group.component.html',
  styleUrls: ['./endpoint-security-group.component.css'],
})
export class EndpointSecurityGroupComponent implements OnInit {
  public ModalMode = ModalMode;
  public tableComponentDto = new TableComponentDto();
  public searchColumns: SearchColumnConfig[] = [
    { displayName: 'Alias', propertyName: 'alias', searchOperator: 'cont' },
    { displayName: 'Description', propertyName: 'description', searchOperator: 'cont' },
    { displayName: 'IntraEsgIsolation', propertyName: 'intraEsgIsolation', propertyType: 'boolean' },
  ];
  public isLoading = false;
  public endpointSecurityGroups: GetManyEndpointSecurityGroupResponseDto;
  public tenantId: string;
  public perPage = 20;
  public endpointSecurityGroupModalSubscription: Subscription;
  vrfs: GetManyVrfResponseDto;
  applicationProfiles: GetManyApplicationProfileResponseDto;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
  @ViewChild('expandedRows') expandedRows: TemplateRef<any>;
  @ViewChild('applicationProfileTemplate') applicationProfileTemplate: TemplateRef<any>;
  @ViewChild('vrfTemplate') vrfTemplate: TemplateRef<any>;

  public config: TableConfig<any> = {
    description: 'EndpointSecurity Groups',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Admin State', property: 'adminState' },
      { name: 'Description', property: 'description' },
      { name: 'Intra Esg Isolation', property: 'intraEsgIsolation' },
      { name: 'Application Profile', template: () => this.applicationProfileTemplate },
      { name: 'Vrf', template: () => this.vrfTemplate },
      { name: '', template: () => this.actionsTemplate },
    ],
    // TODO: Implement appcentric aci runtime
    // expandableRows: () => this.expandedRows,
  };
  constructor(
    private endpointSecurityGroupService: V2AppCentricEndpointSecurityGroupsService,
    private tableContextService: TableContextService,
    private ngx: NgxSmartModalService,
    private router: Router,
    private applicationProfileService: V2AppCentricApplicationProfilesService,
    private vrfService: V2AppCentricVrfsService,
  ) {
    const advancedSearchAdapter = new AdvancedSearchAdapter<EndpointSecurityGroup>();
    advancedSearchAdapter.setService(this.endpointSecurityGroupService);
    advancedSearchAdapter.setServiceName('V2AppCentricEndpointSecurityGroupsService');
    this.config.advancedSearchAdapter = advancedSearchAdapter;

    const match = this.router.routerState.snapshot.url.match(
      /tenant-select\/edit\/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}/,
    );
    if (match) {
      const uuid = match[0].split('/')[2];
      this.tenantId = uuid;
    }
  }

  ngOnInit(): void {
    this.getEndpointSecurityGroups();
    this.getApplicationProfiles();
    this.getVrfs();
  }

  public getEndpointSecurityGroups(event?): void {
    this.isLoading = true;
    let eventParams;
    if (event) {
      this.tableComponentDto.page = event.page ? event.page : 1;
      this.tableComponentDto.perPage = event.perPage ? event.perPage : 20;
      const { searchText } = event;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      if (propertyName === 'intraEsgIsolation') {
        eventParams = `${propertyName}||eq||${searchText}`;
      } else if (propertyName) {
        eventParams = `${propertyName}||cont||${searchText}`;
      }
    }
    this.endpointSecurityGroupService
      .getManyEndpointSecurityGroup({
        filter: [`tenantId||eq||${this.tenantId}`, eventParams],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
        relations: ['applicationProfile', 'vrf', 'selectors'],
      })
      .subscribe(
        data => {
          this.endpointSecurityGroups = data;
        },
        () => {
          this.endpointSecurityGroups = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public deleteEndpointSecurityGroup(endpointsecurityGroup: EndpointSecurityGroup): void {
    if (endpointsecurityGroup.deletedAt) {
      const modalDto = new YesNoModalDto(
        'Delete EndpointSecurity Group',
        `Are you sure you want to permanently delete this endpointsecurity group and its selectors? ${endpointsecurityGroup.name}?`,
      );
      const onConfirm = () => {
        this.endpointSecurityGroupService
          .cascadeDeleteTierEndpointSecurityGroup({ endpointSecurityGroupId: endpointsecurityGroup.id })
          .subscribe(() => {
            const params = this.tableContextService.getSearchLocalStorage();
            const { filteredResults } = params;

            if (filteredResults) {
              this.getEndpointSecurityGroups(params);
            } else {
              this.getEndpointSecurityGroups();
            }
          });
      };
      SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
    } else {
      this.endpointSecurityGroupService
        .softDeleteOneEndpointSecurityGroup({
          id: endpointsecurityGroup.id,
        })
        .subscribe(() => {
          const params = this.tableContextService.getSearchLocalStorage();
          const { filteredResults } = params;

          if (filteredResults) {
            this.getEndpointSecurityGroups(params);
          } else {
            this.getEndpointSecurityGroups();
          }
        });
    }
  }

  public restoreEndpointSecurityGroup(endpointsecurityGroup: EndpointSecurityGroup): void {
    if (!endpointsecurityGroup.deletedAt) {
      return;
    }

    this.endpointSecurityGroupService
      .restoreOneEndpointSecurityGroup({
        id: endpointsecurityGroup.id,
      })
      .subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        if (filteredResults) {
          this.getEndpointSecurityGroups(params);
        } else {
          this.getEndpointSecurityGroups();
        }
      });
  }

  public openEndpointSecurityGroupModal(modalMode: ModalMode, endpointSecurityGroup?: EndpointSecurityGroup): void {
    const dto = {} as any;

    dto.modalMode = modalMode;

    dto.endpointSecurityGroup = endpointSecurityGroup;
    if (dto.modalMode === 'Edit') {
      dto.selectors = endpointSecurityGroup.selectors;
    }

    this.subscribeToEndpointSecurityGroupModal();
    this.ngx.setModalData(dto, 'endpointSecurityGroupModal');
    this.ngx.getModal('endpointSecurityGroupModal').open();
  }

  private subscribeToEndpointSecurityGroupModal(): void {
    this.endpointSecurityGroupModalSubscription = this.ngx.getModal('endpointSecurityGroupModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('endpointSecurityGroupModal');
      this.endpointSecurityGroupModalSubscription.unsubscribe();

      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      if (filteredResults) {
        this.getEndpointSecurityGroups(params);
      } else {
        this.getEndpointSecurityGroups();
      }
    });
  }

  sanitizeData(entities: any) {
    return entities.map(entity => {
      this.mapToCsv(entity);
      return entity;
    });
  }

  mapToCsv = obj => {
    Object.entries(obj).forEach(([key, val]) => {
      if (val === 'false' || val === 'f') {
        obj[key] = false;
      }
      if (val === 'true' || val === 't') {
        obj[key] = true;
      }
      if (val === null || val === '') {
        delete obj[key];
      }
      if (key === 'tenantName') {
        obj.tenantId = this.tenantId;
        delete obj[key];
      }
      if (key === 'applicationProfileName') {
        obj[key] = ObjectUtil.getObjectId(val as string, this.applicationProfiles.data);
        obj.applicationProfileId = obj[key];
        delete obj[key];
      }
      if (key === 'vrfName') {
        obj[key] = ObjectUtil.getObjectId(val as string, this.vrfs.data);
        obj.bridgeDomainId = obj[key];
        delete obj[key];
      }
    });
    return obj;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public importEndpointSecurityGroups(event): void {
    const modalDto = new YesNoModalDto(
      'Import EndpointSecurity Groups',
      `Are you sure you would like to import ${event.length} EndpointSecurity Group${event.length > 1 ? 's' : ''}?`,
    );

    const onConfirm = () => {
      const dto = this.sanitizeData(event);
      this.endpointSecurityGroupService.createManyEndpointSecurityGroup({ createManyEndpointSecurityGroupDto: { bulk: dto } }).subscribe(
        () => {},
        () => {},
        () => {
          this.getEndpointSecurityGroups();
        },
      );
    };
    const onClose = () => {
      this.getEndpointSecurityGroups();
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm, onClose);
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getEndpointSecurityGroups(event);
  }

  private getVrfs(): void {
    this.isLoading = true;
    this.vrfService
      .getManyVrf({
        filter: [`tenantId||eq||${this.tenantId}`],
        page: 1,
        perPage: 1000,
      })
      .subscribe(
        data => {
          this.vrfs = data;
        },
        () => {
          this.vrfs = null;
        },
      );
  }
  private getApplicationProfiles(): void {
    this.isLoading = true;
    this.applicationProfileService
      .getManyApplicationProfile({
        filter: [`tenantId||eq||${this.tenantId}`],
        page: 1,
        perPage: 1000,
      })
      .subscribe(
        data => {
          this.applicationProfiles = data;
        },
        () => {
          this.applicationProfiles = null;
        },
      );
  }
}
