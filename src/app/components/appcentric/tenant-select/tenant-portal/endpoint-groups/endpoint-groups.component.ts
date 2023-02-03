import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { EndpointGroupPaginationResponse, V2AppCentricEndpointGroupsService, EndpointGroup } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { EndpointGroupModalDto } from 'src/app/models/appcentric/endpoint-group-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { TableContextService } from 'src/app/services/table-context.service';

@Component({
  selector: 'app-endpoint-groups',
  templateUrl: './endpoint-groups.component.html',
  styleUrls: ['./endpoint-groups.component.css'],
})
export class EndpointGroupsComponent implements OnInit {
  public ModalMode = ModalMode;
  public currentEndpointGroupPage = 1;
  public perPage = 20;
  public endpointGroups = {} as EndpointGroupPaginationResponse;
  public tableComponentDto = new TableComponentDto();
  private endpointGroupModalSubscription: Subscription;
  public tenantId: string;

  public isLoading = false;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [];

  public config: TableConfig<any> = {
    description: 'EndpointGroups',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Alias', property: 'alias' },
      { name: 'Description', property: 'description' },
      { name: 'Intra Epg Isolation', property: 'intraEpgIsolation' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(
    private endpointGroupService: V2AppCentricEndpointGroupsService,
    private tableContextService: TableContextService,
    private ngx: NgxSmartModalService,
    private router: Router,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const match = event.url.match(/\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\//);
        if (match) {
          this.tenantId = match[1];
        }
      }
    });
  }

  ngOnInit(): void {
    this.getEndpointGroups();
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getEndpointGroups(event);
  }

  public getEndpointGroups(event?): void {
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
    this.endpointGroupService
      .findAllEndpointGroup({
        filter: [`tenantId||eq||${this.tenantId}`, eventParams],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
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
  }

  public deleteEndpointGroup(endpointGroup: EndpointGroup): void {
    if (endpointGroup.deletedAt) {
      this.endpointGroupService.removeEndpointGroup({ uuid: endpointGroup.id }).subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if endpointGrouped results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.getEndpointGroups(params);
        } else {
          this.getEndpointGroups();
        }
      });
    } else {
      this.endpointGroupService
        .updateEndpointGroup({
          uuid: endpointGroup.id,
          endpointGroup: { deleted: true } as EndpointGroup,
        })
        .subscribe(() => {
          const params = this.tableContextService.getSearchLocalStorage();
          const { filteredResults } = params;

          // if endpointGrouped results boolean is true, apply search params in the
          // subsequent get call
          if (filteredResults) {
            this.getEndpointGroups(params);
          } else {
            this.getEndpointGroups();
          }
        });
    }
  }

  public restoreEndpointGroup(endpointGroup: EndpointGroup): void {
    if (!endpointGroup.deletedAt) {
      return;
    }

    this.endpointGroupService
      .updateEndpointGroup({
        uuid: endpointGroup.id,
        endpointGroup: { deleted: false } as EndpointGroup,
      })
      .subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if endpointGrouped results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.getEndpointGroups(params);
        } else {
          this.getEndpointGroups();
        }
      });
  }

  public openEndpointGroupModal(modalMode: ModalMode, endpointGroup?: EndpointGroup): void {
    const dto = new EndpointGroupModalDto();

    dto.modalMode = modalMode;

    if (modalMode === ModalMode.Edit) {
      dto.endpointGroup = endpointGroup;
    }

    this.subscribeToEndpointGroupModal();
    this.ngx.setModalData(dto, 'endpointGroupModal');
    this.ngx.getModal('endpointGroupModal').open();
  }

  private subscribeToEndpointGroupModal(): void {
    this.endpointGroupModalSubscription = this.ngx.getModal('endpointGroupModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('endpointGroupModal');
      this.endpointGroupModalSubscription.unsubscribe();
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if endpointGrouped results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.getEndpointGroups(params);
      } else {
        this.getEndpointGroups();
      }
    });
  }

  public importEndpointGroupsConfig(endpointGroup: EndpointGroup[]): void {
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
}
