import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  ApplicationProfile,
  GetManyApplicationProfileResponseDto,
  GetManyEndpointGroupResponseDto,
  V2AppCentricApplicationProfilesService,
  V2AppCentricEndpointGroupsService,
  V2AppCentricTenantsService,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { AdvancedSearchAdapter } from 'src/app/common/advanced-search/advanced-search.adapter';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { ApplicationProfileModalDto } from 'src/app/models/appcentric/application-profile-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-application-profile',
  templateUrl: './application-profile.component.html',
  styleUrls: ['./application-profile.component.css'],
})
export class ApplicationProfileComponent implements OnInit {
  public ModalMode = ModalMode;
  public currentApplicationProfilePage = 1;
  public perPage = 20;
  public applicationProfiles = {} as GetManyApplicationProfileResponseDto;
  public tableComponentDto = new TableComponentDto();
  public applicationPofileModalSubscription: Subscription;
  private endpointGroupModalSubscription: Subscription;

  public tenantId: string;
  public tenantName: string;

  public isLoading = false;

  public endpointGroups: GetManyEndpointGroupResponseDto;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [
    { displayName: 'Alias', propertyName: 'alias', searchOperator: 'cont' },
    { displayName: 'Description', propertyName: 'description', searchOperator: 'cont' },
  ];

  public config: TableConfig<any> = {
    description: 'Application Profiles',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Alias', property: 'alias' },
      { name: 'Description', property: 'description' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(
    private applicationProfileService: V2AppCentricApplicationProfilesService,
    private tableContextService: TableContextService,
    private ngx: NgxSmartModalService,
    private router: Router,
    private endpointGroupService: V2AppCentricEndpointGroupsService,
    private tenantService: V2AppCentricTenantsService,
  ) {
    const advancedSearchAdapter = new AdvancedSearchAdapter<ApplicationProfile>();
    advancedSearchAdapter.setService(this.applicationProfileService);
    advancedSearchAdapter.setServiceName('V2AppCentricApplicationProfilesService');
    this.config.advancedSearchAdapter = advancedSearchAdapter;

    const match = this.router.routerState.snapshot.url.match(
      /tenant-select\/edit\/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}/,
    );
    if (match) {
      const uuid = match[0].split('/')[2];
      this.tenantId = uuid;
      console.log('run??');
      this.tenantService.getManyTenant({ page: 1, perPage: 10000 }).subscribe(data => {
        this.tenantName = ObjectUtil.getObjectName(this.tenantId, data.data);
      });
    }
  }

  ngOnInit(): void {
    this.getApplicationProfiles();
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getApplicationProfiles(event);
  }

  public getApplicationProfiles(event?): void {
    this.isLoading = true;
    let eventParams;
    if (event) {
      this.tableComponentDto.page = event.page ? event.page : 1;
      this.tableComponentDto.perPage = event.perPage ? event.perPage : 20;
      const { searchText } = event;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      if (propertyName) {
        eventParams = `${propertyName}||cont||${searchText}`;
      }
    }
    this.applicationProfileService
      .getManyApplicationProfile({
        filter: [`tenantId||eq||${this.tenantId}`, eventParams],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe(
        data => {
          this.applicationProfiles = data;
        },
        () => {
          this.applicationProfiles = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public deleteApplicationProfile(applicationProfile: ApplicationProfile): void {
    if (applicationProfile.deletedAt) {
      this.applicationProfileService.deleteOneApplicationProfile({ id: applicationProfile.id }).subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.getApplicationProfiles(params);
        } else {
          this.getApplicationProfiles();
        }
      });
    } else {
      this.applicationProfileService
        .softDeleteOneApplicationProfile({
          id: applicationProfile.id,
        })
        .subscribe(() => {
          const params = this.tableContextService.getSearchLocalStorage();
          const { filteredResults } = params;

          // if filtered results boolean is true, apply search params in the
          // subsequent get call
          if (filteredResults) {
            this.getApplicationProfiles(params);
          } else {
            this.getApplicationProfiles();
          }
        });
    }
  }

  public restoreApplicationProfile(applicationProfile: ApplicationProfile): void {
    if (!applicationProfile.deletedAt) {
      return;
    }

    this.applicationProfileService
      .restoreOneApplicationProfile({
        id: applicationProfile.id,
      })
      .subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.getApplicationProfiles(params);
        } else {
          this.getApplicationProfiles();
        }
      });
  }

  public openApplicationProfileModal(modalMode: ModalMode, applicationProfile?: ApplicationProfile): void {
    const dto = new ApplicationProfileModalDto();

    dto.ModalMode = modalMode;

    if (modalMode === ModalMode.Edit) {
      dto.ApplicationProfile = applicationProfile;
      // this.getEndpointGroups(applicationProfile.id);
    }

    this.subscribeToApplicationProfileModal();
    this.ngx.setModalData(dto, 'applicationProfileModal');
    this.ngx.getModal('applicationProfileModal').open();
  }

  public subscribeToApplicationProfileModal(): void {
    this.applicationPofileModalSubscription = this.ngx.getModal('applicationProfileModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('applicationProfileModal');
      this.applicationPofileModalSubscription.unsubscribe();
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      if (filteredResults) {
        this.getApplicationProfiles(params);
      } else {
        this.getApplicationProfiles();
      }
    });
  }

  public sanitizeData(entities) {
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
    });
    return obj;
  };

  private warnDuringUpload(e, event) {
    const warningModal = new YesNoModalDto(
      'WARNING',
      `One or more entries' Tenant value does not match the Tenant that is currently selected, 
         we will attempt to assign the currently selected Tenant to any 
         incorrect entries, this may cause failures in the bulk upload, would you still like to proceed?
            "${e.tenantName}" vs "${this.tenantName}"`,
    );
    // const onConfirm = () => {
    //   const dto = this.sanitizeData(event);
    //   this.uploadAppProfiles(dto);
    // };
    const onClose = () => this.getApplicationProfiles();
    SubscriptionUtil.subscribeToYesNoModal(warningModal, this.ngx, onClose);
  }

  private uploadAppProfiles(dto) {
    this.applicationProfileService.createManyApplicationProfile({ createManyApplicationProfileDto: { bulk: dto } }).subscribe(
      () => {},
      () => {},
      () => {
        this.getApplicationProfiles();
      },
    );
  }

  public importAppProfiles(event): void {
    const modalDto = new YesNoModalDto(
      'Import Application Profiles',
      `Are you sure you would like to import ${event.length} Application Profile${event.length > 1 ? 's' : ''}?`,
    );

    event.map(e => {
      if (e.tenantName !== this.tenantName) {
        return this.warnDuringUpload(e, event);
      }
    });
    const onConfirm = () => {
      const dto = this.sanitizeData(event);
      this.applicationProfileService.createManyApplicationProfile({ createManyApplicationProfileDto: { bulk: dto } }).subscribe(
        () => {},
        () => {},
        () => {
          this.getApplicationProfiles();
        },
      );
    };

    const onClose = () => {
      this.getApplicationProfiles();
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm, onClose);
  }

  // public getEndpointGroups(applicationProfileId: string) {
  //   this.isLoading = true;
  //   const endpointGroups = this.endpointGroupService
  //     .getManyEndpointGroup({
  //       filter: [`applicationProfileId||eq||${applicationProfileId}`] as Array<string>,
  //       page: 1,
  //       perPage: 5,
  //     })
  //     .subscribe(
  //       data => {
  //         this.endpointGroups = data;
  //       },
  //       () => {
  //         this.endpointGroups = null;
  //       },
  //       () => {
  //         this.isLoading = false;
  //       },
  //     );

  //   return endpointGroups;
  // }
}
