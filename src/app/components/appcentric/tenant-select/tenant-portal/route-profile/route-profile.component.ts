import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import {
  RouteProfilePaginationResponse,
  RouteProfile,
  VrfPaginationResponse,
  V2AppCentricVrfsService,
  Vrf,
  V2AppCentricRouteProfilesService,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import { RouteProfileModalDto } from '../../../../../models/appcentric/route-profile-modal-dto';

@Component({
  selector: 'app-route-profile',
  templateUrl: './route-profile.component.html',
})
export class RouteProfileComponent implements OnInit {
  public ModalMode = ModalMode;
  public currentRouteProfilePage = 1;
  public perPage = 20;
  public routeProfiles = {} as RouteProfilePaginationResponse;
  public tableComponentDto = new TableComponentDto();
  private routeProfilesModalSubscription: Subscription;
  public tenantId: string;
  public vrfs: VrfPaginationResponse;

  public isLoading = false;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [];

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
    private vrfService: V2AppCentricVrfsService,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const match = event.url.match(/tenant-select\/edit\/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}/);
        if (match) {
          const uuid = match[0].split('/')[2];
          this.tenantId = uuid;
        }
      }
    });
  }

  ngOnInit(): void {
    this.getRouteProfile();
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getRouteProfile(event);
  }

  public getRouteProfile(event?): void {
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
      .findAllRouteProfile({
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

  public deleteRouteProfile(routeProfile: RouteProfile): void {
    if (routeProfile.deletedAt) {
      this.routeProfileService.removeRouteProfile({ uuid: routeProfile.id }).subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if routeProfileed results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.getRouteProfile(params);
        } else {
          this.getRouteProfile();
        }
      });
    } else {
      this.routeProfileService
        .softDeleteRouteProfile({
          uuid: routeProfile.id,
        })
        .subscribe(() => {
          const params = this.tableContextService.getSearchLocalStorage();
          const { filteredResults } = params;

          // if routeProfileed results boolean is true, apply search params in the
          // subsequent get call
          if (filteredResults) {
            this.getRouteProfile(params);
          } else {
            this.getRouteProfile();
          }
        });
    }
  }

  public restoreRouteProfile(routeProfile: RouteProfile): void {
    if (!routeProfile.deletedAt) {
      return;
    }

    this.routeProfileService
      .restoreRouteProfile({
        uuid: routeProfile.id,
      })
      .subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if routeProfileed results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.getRouteProfile(params);
        } else {
          this.getRouteProfile();
        }
      });
  }

  public openRouteProfileModal(modalMode: ModalMode, routeProfile?: RouteProfile): void {
    const dto = new RouteProfileModalDto();

    dto.modalMode = modalMode;

    if (modalMode === ModalMode.Edit) {
      dto.routeProfile = routeProfile;
    }

    this.getVrfs();

    this.subscribeToRouteProfileModal();
    this.ngx.setModalData(dto, 'routeProfilesModal');
    this.ngx.getModal('routeProfilesModal').open();
  }

  private subscribeToRouteProfileModal(): void {
    this.routeProfilesModalSubscription = this.ngx.getModal('routeProfilesModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('routeProfilesModal');
      this.routeProfilesModalSubscription.unsubscribe();
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if routeProfileed results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.getRouteProfile(params);
      } else {
        this.getRouteProfile();
      }
    });
  }

  public importRouteProfileConfig(routeProfile: RouteProfile[]): void {
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

  public getVrfs(event?): void {
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
    this.vrfService
      .findAllVrf({
        filter: [`tenantId||eq||${this.tenantId}`, eventParams],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe(
        data => {
          this.vrfs = data;
        },
        () => {
          this.vrfs = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }
}
