import { Component, enableProdMode, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import {
  ApplicationProfile,
  ApplicationProfilePaginationResponse,
  EndpointGroup,
  EndpointGroupPaginationResponse,
  V2AppCentricApplicationProfilesService,
  V2AppCentricEndpointGroupsService,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { ApplicationProfileModalDto } from 'src/app/models/appcentric/application-profile-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { TableContextService } from 'src/app/services/table-context.service';

@Component({
  selector: 'app-application-profile',
  templateUrl: './application-profile.component.html',
  styleUrls: ['./application-profile.component.css'],
})
export class ApplicationProfileComponent implements OnInit {
  public ModalMode = ModalMode;
  public currentApplicationProfilePage = 1;
  public perPage = 20;
  public applicationProfiles = {} as ApplicationProfilePaginationResponse;
  public tableComponentDto = new TableComponentDto();
  private applicationPofileModalSubscription: Subscription;
  private endpointGroupModalSubscription: Subscription;

  public tenantId: string;

  public isLoading = false;

  public endpointGroups: EndpointGroupPaginationResponse;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [];

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
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const match = event.url.match(/tenant-select\/edit\/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}/);
        if (match) {
          const uuid = match[0].split('/')[2];
          this.tenantId = uuid;
          console.log(this.tenantId);
        }
      }
    });
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
      .findAllApplicationProfile({
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
      this.applicationProfileService.removeApplicationProfile({ uuid: applicationProfile.id }).subscribe(() => {
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
        .softDeleteApplicationProfile({
          uuid: applicationProfile.id,
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
      .restoreApplicationProfile({
        uuid: applicationProfile.id,
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
      this.getEndpointGroups(applicationProfile.id);
    }

    this.subscribeToApplicationProfileModal();
    this.ngx.setModalData(dto, 'applicationProfileModal');
    this.ngx.getModal('applicationProfileModal').open();
  }

  private subscribeToApplicationProfileModal(): void {
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

  public openEndpointGroupModal(applicationProfile: ApplicationProfile): void {
    const dto = new ApplicationProfileModalDto();

    dto.ApplicationProfile = applicationProfile;
    this.subscribeToEndpointGroupModal();
    this.ngx.setModalData(dto, 'endpointGroupModal');
    this.ngx.getModal('endpointGroupModal').open();
  }

  private subscribeToEndpointGroupModal(): void {
    this.endpointGroupModalSubscription = this.ngx.getModal('endpointGroupModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('endpointGroupModal');
      this.endpointGroupModalSubscription.unsubscribe();
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      if (filteredResults) {
        this.getApplicationProfiles(params);
      } else {
        this.getApplicationProfiles();
      }
    });
  }

  public importApplicationProfilesConfig(applicationProfiles: ApplicationProfile[]): void {
    // const tenantEnding = tenants.length > 1 ? 's' : '';
    // const modalDto = new YesNoModalDto(
    //   `Import Tier${tenantEnding}`,
    //   `Would you like to import ${tenants.length} tier${tenantEnding}?`,
    //   `Import Tier${tenantEnding}`,
    //   'Cancel',
    // );
    // const onConfirm = () => {
    //   this.tenantService
    //     .createManyTier({
    //       createManyTierDto: { bulk: this.sanitizeTiers(tiers) },
    //     })
    //     .subscribe(() => {
    //       this.getTiers();
    //     });
    // };
    // SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  public getEndpointGroups(applicationProfileId: string) {
    this.isLoading = true;
    const endpointGroups = this.endpointGroupService
      .findAllEndpointGroup({
        filter: [`applicationProfileId||eq||${applicationProfileId}`] as Array<string>,
        page: 1,
        perPage: 5,
      })
      .subscribe(
        data => {
          this.endpointGroups = data;
        },
        () => {
          this.endpointGroups = null;
        },
        () => {
          this.isLoading = false;
        },
      );

    return endpointGroups;
  }
}
