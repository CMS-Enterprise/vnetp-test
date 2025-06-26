import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GetManyRouteProfileResponseDto, RouteProfile, V2AppCentricRouteProfilesService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import { RouteProfileModalDto } from '../../../../../models/appcentric/route-profile-modal-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { AdvancedSearchAdapter } from 'src/app/common/advanced-search/advanced-search.adapter';

@Component({
  selector: 'app-route-profile',
  templateUrl: './route-profile.component.html',
})
export class RouteProfileComponent implements OnInit {
  public ModalMode = ModalMode;
  public currentRouteProfilePage = 1;
  public perPage = 20;
  public routeProfiles = {} as GetManyRouteProfileResponseDto;
  public tableComponentDto = new TableComponentDto();
  public routeProfileModalSubscription: Subscription;
  public tenantId: string;

  public isLoading = false;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [
    { displayName: 'Alias', propertyName: 'alias' },
    { displayName: 'Description', propertyName: 'description' },
  ];

  public config: TableConfig<any> = {
    description: 'RouteProfile',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Alias', property: 'alias' },
      { name: 'Description', property: 'description' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(
    private routeProfileService: V2AppCentricRouteProfilesService,
    private tableContextService: TableContextService,
    private ngx: NgxSmartModalService,
    private router: Router,
  ) {
    const advancedSearchAdapter = new AdvancedSearchAdapter<RouteProfile>();
    advancedSearchAdapter.setService(this.routeProfileService);
    advancedSearchAdapter.setServiceName('V2AppCentricRouteProfilesService');
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
    this.getRouteProfiles();
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getRouteProfiles(event);
  }

  public getRouteProfiles(event?): void {
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
    this.routeProfileService
      .getManyRouteProfile({
        filter: [`tenantId||eq||${this.tenantId}`, eventParams],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe(
        data => {
          this.routeProfiles = data;
        },
        () => {
          this.routeProfiles = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  private showConfirmationModal(title: string, message: string, onConfirm: () => void): void {
    const modalDto = new YesNoModalDto(title, message);

    const onConfirmWrapper = () => {
      onConfirm();
    };

    const onClose = () => {
      this.refreshRouteProfiles();
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirmWrapper, onClose);
  }

  private refreshRouteProfiles(): void {
    const params = this.tableContextService.getSearchLocalStorage();
    const { filteredResults } = params;

    if (filteredResults) {
      this.getRouteProfiles(params);
    } else {
      this.getRouteProfiles();
    }
  }

  public deleteRouteProfile(routeProfile: RouteProfile): void {
    const isHardDelete = routeProfile.deletedAt;
    const title = isHardDelete ? 'Delete Route Profile' : 'Soft Delete Route Profile';
    const message = isHardDelete
      ? `Are you sure you want to delete ${routeProfile.name}? This cannot be undone.`
      : `Are you sure you want to soft delete ${routeProfile.name}? This can be undone.`;

    const onConfirm = () => {
      const deleteMethod = isHardDelete
        ? this.routeProfileService.deleteOneRouteProfile({ id: routeProfile.id })
        : this.routeProfileService.softDeleteOneRouteProfile({ id: routeProfile.id });

      deleteMethod.subscribe(() => {
        this.refreshRouteProfiles();
      });
    };

    this.showConfirmationModal(title, message, onConfirm);
  }

  public restoreRouteProfile(routeProfile: RouteProfile): void {
    if (!routeProfile.deletedAt) {
      return;
    }

    const onConfirm = () => {
      this.routeProfileService.restoreOneRouteProfile({ id: routeProfile.id }).subscribe(() => {
        this.refreshRouteProfiles();
      });
    };

    this.showConfirmationModal('Restore Route Profile', `Are you sure you want to restore ${routeProfile.name}?`, onConfirm);
  }

  public deprovisionRouteProfile(routeProfile: RouteProfile): void {
    const onConfirm = () => {
      this.routeProfileService.deprovisionOneRouteProfile({ id: routeProfile.id }).subscribe(() => {
        this.refreshRouteProfiles();
      });
    };

    this.showConfirmationModal('Deprovision Route Profile', `Are you sure you would like to deprovision ${routeProfile.name}?`, onConfirm);
  }

  public openRouteProfileModal(modalMode: ModalMode, routeProfile?: RouteProfile): void {
    const dto = new RouteProfileModalDto();

    dto.modalMode = modalMode;

    if (modalMode === ModalMode.Edit) {
      dto.routeProfile = routeProfile;
    }

    this.subscribeToRouteProfileModal();
    this.ngx.setModalData(dto, 'routeProfileModal');
    this.ngx.getModal('routeProfileModal').open();
  }

  public subscribeToRouteProfileModal(): void {
    this.routeProfileModalSubscription = this.ngx.getModal('routeProfileModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('routeProfileModal');
      this.routeProfileModalSubscription.unsubscribe();
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if routeProfile results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.getRouteProfiles(params);
      } else {
        this.getRouteProfiles();
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

  public importRouteProfiles(event): void {
    const onConfirm = () => {
      const dto = this.sanitizeData(event);
      this.routeProfileService.createManyRouteProfile({ createManyRouteProfileDto: { bulk: dto } }).subscribe(
        () => {},
        () => {},
        () => {
          this.refreshRouteProfiles();
        },
      );
    };

    this.showConfirmationModal(
      'Import Route Profiles',
      `Are you sure you would like to import ${event.length} Route Profile${event.length > 1 ? 's' : ''}?`,
      onConfirm,
    );
  }
}
