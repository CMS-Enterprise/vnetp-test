import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  BridgeDomain,
  GetManyBridgeDomainResponseDto,
  GetManyVrfResponseDto,
  V2AppCentricBridgeDomainsService,
  V2AppCentricVrfsService,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { AdvancedSearchAdapter } from 'src/app/common/advanced-search/advanced-search.adapter';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { BridgeDomainModalDto } from 'src/app/models/appcentric/bridge-domain-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-bridge-domain',
  templateUrl: './bridge-domain.component.html',
  styleUrls: ['./bridge-domain.component.css'],
})
export class BridgeDomainComponent implements OnInit {
  public ModalMode = ModalMode;
  public currentBridgeDomainPage = 1;
  public perPage = 20;
  public bridgeDomains = {} as GetManyBridgeDomainResponseDto;
  public tableComponentDto = new TableComponentDto();
  public bridgeDomainModalSubscription: Subscription;
  public subnetsModalSubscription: Subscription;
  public tenantId: string;
  public vrfs: GetManyVrfResponseDto;

  public isLoading = false;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [
    { displayName: 'Alias', propertyName: 'alias', searchOperator: 'cont' },
    { displayName: 'Description', propertyName: 'description', searchOperator: 'cont' },
    { displayName: 'Mac Address', propertyName: 'bdMacAddress' },
    { displayName: 'Arp Flooding', propertyName: 'arpFlooding', propertyType: 'boolean' },
    { displayName: 'Limit Local IP Learning', propertyName: 'limitLocalIpLearning', propertyType: 'boolean' },
    { displayName: 'Move Detection Mode Garp', propertyName: 'epMoveDetectionModeGarp', propertyType: 'boolean' },
  ];

  public config: TableConfig<any> = {
    description: 'Bridge Domains',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Alias', property: 'alias' },
      { name: 'Description', property: 'description' },
      { name: 'Arp Flooding', property: 'arpFlooding' },
      { name: 'Mac Address', property: 'bdMacAddress' },
      { name: 'Limit Local IP Learning', property: 'limitLocalIpLearning' },
      { name: 'Host Based Routing', property: 'hostBasedRouting' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(
    private bridgeDomainService: V2AppCentricBridgeDomainsService,
    private tableContextService: TableContextService,
    private ngx: NgxSmartModalService,
    private router: Router,
    private vrfService: V2AppCentricVrfsService,
  ) {
    const advancedSearchAdapter = new AdvancedSearchAdapter<BridgeDomain>();
    advancedSearchAdapter.setService(this.bridgeDomainService);
    advancedSearchAdapter.setServiceName('V2AppCentricBridgeDomainsService');
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
    this.getBridgeDomains();
    this.getVrfs();
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getBridgeDomains(event);
  }

  public getBridgeDomains(event?): void {
    this.isLoading = true;
    let eventParams;
    if (event) {
      this.tableComponentDto.page = event.page ? event.page : 1;
      this.tableComponentDto.perPage = event.perPage ? event.perPage : 20;
      const { searchText } = event;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      if (propertyName === 'name' || propertyName === 'alias' || propertyName === 'description') {
        eventParams = `${propertyName}||cont||${searchText}`;
      } else if (propertyName) {
        eventParams = `${propertyName}||eq||${searchText}`;
      }
    }
    this.bridgeDomainService
      .getManyBridgeDomain({
        filter: [`tenantId||eq||${this.tenantId}`, eventParams],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe(
        data => {
          this.bridgeDomains = data;
        },
        () => {
          this.bridgeDomains = null;
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
      this.refreshBridgeDomains();
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirmWrapper, onClose);
  }

  private refreshBridgeDomains(): void {
    const params = this.tableContextService.getSearchLocalStorage();
    const { filteredResults } = params;

    if (filteredResults) {
      this.getBridgeDomains(params);
    } else {
      this.getBridgeDomains();
    }
  }

  public deleteBridgeDomain(bridgeDomain: BridgeDomain): void {
    const isHardDelete = bridgeDomain.deletedAt;
    const title = isHardDelete ? 'Delete Bridge Domain' : 'Soft Delete Bridge Domain';
    const message = isHardDelete
      ? `Are you sure you want to delete ${bridgeDomain.name}? This cannot be undone.`
      : `Are you sure you want to soft delete ${bridgeDomain.name}? This can be undone.`;

    const onConfirm = () => {
      const deleteMethod = isHardDelete
        ? this.bridgeDomainService.deleteOneBridgeDomain({ id: bridgeDomain.id })
        : this.bridgeDomainService.softDeleteOneBridgeDomain({ id: bridgeDomain.id });

      deleteMethod.subscribe(() => {
        this.refreshBridgeDomains();
      });
    };

    this.showConfirmationModal(title, message, onConfirm);
  }

  public restoreBridgeDomain(bridgeDomain: BridgeDomain): void {
    if (!bridgeDomain.deletedAt) {
      return;
    }

    const onConfirm = () => {
      this.bridgeDomainService.restoreOneBridgeDomain({ id: bridgeDomain.id }).subscribe(() => {
        this.refreshBridgeDomains();
      });
    };

    this.showConfirmationModal('Restore Bridge Domain', `Are you sure you want to restore ${bridgeDomain.name}?`, onConfirm);
  }

  public deprovisionBridgeDomain(bridgeDomain: BridgeDomain): void {
    const onConfirm = () => {
      this.bridgeDomainService.deprovisionOneBridgeDomain({ id: bridgeDomain.id }).subscribe(() => {
        this.refreshBridgeDomains();
      });
    };

    this.showConfirmationModal('Deprovision Bridge Domain', `Are you sure you would like to deprovision ${bridgeDomain.name}?`, onConfirm);
  }

  public openBridgeDomainModal(modalMode: ModalMode, bridgeDomain?: BridgeDomain): void {
    const dto = new BridgeDomainModalDto();

    dto.modalMode = modalMode;

    if (modalMode === ModalMode.Edit) {
      dto.bridgeDomain = bridgeDomain;
    }

    this.subscribeToBridgeDomainModal();
    this.ngx.setModalData(dto, 'bridgeDomainModal');
    this.ngx.getModal('bridgeDomainModal').open();
  }

  public subscribeToBridgeDomainModal(): void {
    this.bridgeDomainModalSubscription = this.ngx.getModal('bridgeDomainModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('bridgeDomainModal');
      this.bridgeDomainModalSubscription.unsubscribe();
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.getBridgeDomains(params);
      } else {
        this.getBridgeDomains();
      }
    });
  }

  public openSubnetsModal(bridgeDomain: BridgeDomain): void {
    const dto = new BridgeDomainModalDto();
    dto.modalMode = ModalMode.Edit;
    dto.bridgeDomain = bridgeDomain;

    this.subscribeToSubnetsModal();
    this.ngx.setModalData(dto, 'subnetsModal');
    this.ngx.getModal('subnetsModal').open();
  }

  public subscribeToSubnetsModal(): void {
    this.subnetsModalSubscription = this.ngx.getModal('subnetsModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('subnetsModal');
      this.subnetsModalSubscription.unsubscribe();
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.getBridgeDomains(params);
      } else {
        this.getBridgeDomains();
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
      if (key === 'vrfName') {
        obj[key] = ObjectUtil.getObjectId(val as string, this.vrfs.data);
        obj.vrfId = obj[key];
        delete obj[key];
      }
    });
    return obj;
  };

  public importBridgeDomains(event): void {
    const onConfirm = () => {
      const dto = this.sanitizeData(event);
      this.bridgeDomainService.createManyBridgeDomain({ createManyBridgeDomainDto: { bulk: dto } }).subscribe({
        complete: () => {
          this.refreshBridgeDomains();
        },
      });
    };

    this.showConfirmationModal(
      'Import Bridge Domains',
      `Are you sure you would like to import ${event.length} Bridge Domain${event.length > 1 ? 's' : ''}?`,
      onConfirm,
    );
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
      .getManyVrf({
        filter: [`tenantId||eq||${this.tenantId}`, eventParams],
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
        () => {
          this.isLoading = false;
        },
      );
  }
}
