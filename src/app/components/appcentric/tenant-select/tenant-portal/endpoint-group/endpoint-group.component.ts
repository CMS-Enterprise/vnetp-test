import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { TableConfig } from '../../../../../common/table/table.component';
import { TableComponentDto } from '../../../../../models/other/table-component-dto';
import { SearchColumnConfig } from '../../../../../common/search-bar/search-bar.component';
import {
  EndpointGroup,
  GetManyEndpointGroupResponseDto,
  V2AppCentricApplicationProfilesService,
  V2AppCentricBridgeDomainsService,
  V2AppCentricEndpointGroupsService,
  V2AppCentricSelectorsService,
} from '../../../../../../../client';
import { YesNoModalDto } from '../../../../../models/other/yes-no-modal-dto';
import { TableContextService } from '../../../../../services/table-context.service';
import SubscriptionUtil from '../../../../../utils/SubscriptionUtil';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { AdvancedSearchAdapter } from '../../../../../common/advanced-search/advanced-search.adapter';
import { Router } from '@angular/router';
import { ModalMode } from '../../../../../models/other/modal-mode';
import { EndpointGroupModalDto } from '../../../../../models/appcentric/endpoint-group-modal-dto';
import { Subscription } from 'rxjs';
import ObjectUtil from 'src/app/utils/ObjectUtil';

@Component({
  selector: 'app-endpoint-group',
  templateUrl: './endpoint-group.component.html',
  styleUrls: ['./endpoint-group.component.css'],
})
export class EndpointGroupComponent implements OnInit {
  public ModalMode = ModalMode;
  public tableComponentDto = new TableComponentDto();
  public searchColumns: SearchColumnConfig[] = [
    { displayName: 'Alias', propertyName: 'alias', searchOperator: 'cont' },
    { displayName: 'Description', propertyName: 'description', searchOperator: 'cont' },
    { displayName: 'IntraEpgIsolation', propertyName: 'intraEpgIsolation', propertyType: 'boolean' },
    { displayName: 'Esg Matched', propertyName: 'esgMatched', propertyType: 'boolean' },
  ];
  public isLoading = false;
  public endpointGroups: GetManyEndpointGroupResponseDto;
  public tenantId: string;
  public perPage = 20;
  public endpointGroupModalSubscription: Subscription;
  bridgeDomains;
  applicationProfiles;
  public readonly endpointDisplayModalId = 'endpointDisplayModal';

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
  @ViewChild('expandedRows') expandedRows: TemplateRef<any>;
  @ViewChild('applicationProfileTemplate') applicationProfileTemplate: TemplateRef<any>;
  @ViewChild('bridgeDomainTemplate') bridgeDomainTemplate: TemplateRef<any>;
  @ViewChild('selectorTemplate') selectorTemplate: TemplateRef<any>;
  @ViewChild('endpointsTemplate') endpointsTemplate: TemplateRef<any>;

  public config: TableConfig<any> = {
    description: 'Endpoint Groups',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Endpoints', template: () => this.endpointsTemplate },
      { name: 'Alias', property: 'alias' },
      { name: 'Description', property: 'description' },
      { name: 'Intra Epg Isolation', property: 'intraEpgIsolation' },
      { name: 'Application Profile', template: () => this.applicationProfileTemplate },
      { name: 'Bridge Domain', template: () => this.bridgeDomainTemplate },
      { name: 'ESG Matched', template: () => this.selectorTemplate },
      { name: '', template: () => this.actionsTemplate },
    ],
  };
  constructor(
    private endpointGroupService: V2AppCentricEndpointGroupsService,
    private tableContextService: TableContextService,
    private ngx: NgxSmartModalService,
    private router: Router,
    private applicationProfileService: V2AppCentricApplicationProfilesService,
    private bridgeDomainService: V2AppCentricBridgeDomainsService,
    private selectorService: V2AppCentricSelectorsService,
  ) {
    const advancedSearchAdapter = new AdvancedSearchAdapter<EndpointGroup>();
    advancedSearchAdapter.setService(this.endpointGroupService);
    advancedSearchAdapter.setServiceName('V2AppCentricEndpointGroupsService');
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
    this.getEndpointGroups();
    this.getApplicationProfiles();
    this.getBridgeDomains();
  }

  public getEndpointGroups(event?): void {
    this.isLoading = true;
    let eventParams;
    if (event) {
      this.tableComponentDto.page = event.page ? event.page : 1;
      this.tableComponentDto.perPage = event.perPage ? event.perPage : 20;
      const { searchText } = event;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      if (propertyName === 'intraEpgIsolation' || propertyName === 'esgMatched') {
        eventParams = `${propertyName}||eq||${searchText}`;
      } else if (propertyName) {
        eventParams = `${propertyName}||cont||${searchText}`;
      }
    }
    this.endpointGroupService
      .getManyEndpointGroup({
        filter: [`tenantId||eq||${this.tenantId}`, eventParams],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
        relations: ['applicationProfile', 'bridgeDomain', 'selector', 'endpoints', 'endpoints.ipAddresses'],
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

  private showConfirmationModal(title: string, message: string, onConfirm: () => void): void {
    const modalDto = new YesNoModalDto(title, message);

    const onConfirmWrapper = () => {
      onConfirm();
    };

    const onClose = () => {
      this.refreshEndpointGroups();
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirmWrapper, onClose);
  }

  private refreshEndpointGroups(): void {
    const params = this.tableContextService.getSearchLocalStorage();
    const { filteredResults } = params;

    if (filteredResults) {
      this.getEndpointGroups(params);
    } else {
      this.getEndpointGroups();
    }
  }

  public deleteEndpointGroup(endpointGroup: EndpointGroup): void {
    const isHardDelete = endpointGroup.deletedAt;
    const title = isHardDelete ? 'Delete Endpoint Group' : 'Soft Delete Endpoint Group';
    const message = isHardDelete
      ? `Are you sure you want to delete ${endpointGroup.name}? This cannot be undone.`
      : `Are you sure you want to soft delete ${endpointGroup.name}? This can be undone.`;

    const onConfirm = () => {
      const deleteMethod = isHardDelete
        ? this.endpointGroupService.deleteOneEndpointGroup({ id: endpointGroup.id })
        : this.endpointGroupService.softDeleteOneEndpointGroup({ id: endpointGroup.id });

      deleteMethod.subscribe(() => {
        this.refreshEndpointGroups();
      });
    };

    this.showConfirmationModal(title, message, onConfirm);
  }

  public restoreEndpointGroup(endpointGroup: EndpointGroup): void {
    if (!endpointGroup.deletedAt) {
      return;
    }

    const onConfirm = () => {
      this.endpointGroupService.restoreOneEndpointGroup({ id: endpointGroup.id }).subscribe(() => {
        this.refreshEndpointGroups();
      });
    };

    this.showConfirmationModal('Restore Endpoint Group', `Are you sure you want to restore ${endpointGroup.name}?`, onConfirm);
  }

  public deprovisionEndpointGroup(endpointGroup: EndpointGroup): void {
    const onConfirm = () => {
      this.endpointGroupService.deprovisionOneEndpointGroup({ id: endpointGroup.id }).subscribe(() => {
        this.refreshEndpointGroups();
      });
    };

    this.showConfirmationModal(
      'Deprovision Endpoint Group',
      `Are you sure you would like to deprovision ${endpointGroup.name}?`,
      onConfirm,
    );
  }

  public openEndpointGroupModal(modalMode: ModalMode, endpointGroup?: EndpointGroup): void {
    const dto = new EndpointGroupModalDto();

    dto.modalMode = modalMode;

    dto.endpointGroup = endpointGroup;

    this.subscribeToApEndpointGroupModal();
    this.ngx.setModalData(dto, 'endpointGroupModal');
    this.ngx.getModal('endpointGroupModal').open();
  }

  public subscribeToApEndpointGroupModal(): void {
    this.endpointGroupModalSubscription = this.ngx.getModal('endpointGroupModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('endpointGroupModal');
      this.endpointGroupModalSubscription.unsubscribe();

      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      if (filteredResults) {
        this.getEndpointGroups(params);
      } else {
        this.getEndpointGroups();
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
      if (key === 'bridgeDomainName') {
        obj[key] = ObjectUtil.getObjectId(val as string, this.bridgeDomains.data);
        obj.bridgeDomainId = obj[key];
        delete obj[key];
      }
    });
    return obj;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public importEndpointGroups(event): void {
    const onConfirm = () => {
      const dto = this.sanitizeData(event);
      this.endpointGroupService.createManyEndpointGroup({ createManyEndpointGroupDto: { bulk: dto } }).subscribe({
        complete: () => {
          this.refreshEndpointGroups();
        },
      });
    };

    this.showConfirmationModal(
      'Import Endpoint Groups',
      `Are you sure you would like to import ${event.length} Endpoint Group${event.length > 1 ? 's' : ''}?`,
      onConfirm,
    );
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getEndpointGroups(event);
  }

  public getBridgeDomains(): void {
    this.isLoading = true;
    this.bridgeDomainService
      .getManyBridgeDomain({
        filter: [`tenantId||eq||${this.tenantId}`],
        page: 1,
        perPage: 1000,
      })
      .subscribe(
        data => {
          this.bridgeDomains = data;
        },
        () => {
          this.bridgeDomains = null;
        },
        // () => {
        //   this.isLoading = false;
        // },
      );
  }
  public getApplicationProfiles(): void {
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
        // () => {
        //   this.isLoading = false;
        // },
      );
  }

  public openEndpointsModal(endpointGroup: EndpointGroup): void {
    if (!endpointGroup.endpoints || endpointGroup.endpoints.length === 0) {
      return;
    }

    const modalPayload = {
      data: endpointGroup.endpoints,
      context: 'epg' as const,
    };

    this.ngx.setModalData(modalPayload, this.endpointDisplayModalId, true);
    this.ngx.getModal(this.endpointDisplayModalId).open();
  }
}
