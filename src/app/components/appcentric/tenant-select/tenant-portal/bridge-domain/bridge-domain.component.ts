import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import {
  BridgeDomain,
  GetManyBridgeDomainResponseDto,
  L3Out,
  V2AppCentricBridgeDomainsService,
  V2AppCentricL3outsService,
  V2AppCentricVrfsService,
  Vrf,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { AdvancedSearchAdapter } from 'src/app/common/advanced-search/advanced-search.adapter';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { BridgeDomainModalDto } from 'src/app/models/appcentric/bridge-domain-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { TableContextService } from 'src/app/services/table-context.service';

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
  private bridgeDomainModalSubscription: Subscription;
  private subnetsModalSubscription: Subscription;
  public tenantId: string;

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
      { name: 'Move Detection Mode Garp', property: 'epMoveDetectionModeGarp' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(
    private bridgeDomainService: V2AppCentricBridgeDomainsService,
    private tableContextService: TableContextService,
    private ngx: NgxSmartModalService,
    private router: Router,
  ) {
    const advancedSearchAdapter = new AdvancedSearchAdapter<BridgeDomain>();
    advancedSearchAdapter.setService(this.bridgeDomainService);
    advancedSearchAdapter.setServiceName('V2AppCentricBridgeDomainsService');
    this.config.advancedSearchAdapter = advancedSearchAdapter;

    // this.router.events.subscribe(event => {
    //   if (event instanceof NavigationEnd) {
    //     const match = event.url.match(/tenant-select\/edit\/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}/);
    //     if (match) {
    //       const uuid = match[0].split('/')[2];
    //       this.tenantId = uuid;
    //     }
    //   }
    // });

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

  public deleteBridgeDomain(bridgeDomain: BridgeDomain): void {
    if (bridgeDomain.deletedAt) {
      this.bridgeDomainService.deleteOneBridgeDomain({ id: bridgeDomain.id }).subscribe(() => {
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
    } else {
      this.bridgeDomainService
        .softDeleteOneBridgeDomain({
          id: bridgeDomain.id,
        })
        .subscribe(() => {
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
  }

  public restoreBridgeDomain(bridgeDomain: BridgeDomain): void {
    if (!bridgeDomain.deletedAt) {
      return;
    }

    this.bridgeDomainService
      .restoreOneBridgeDomain({
        id: bridgeDomain.id,
      })
      .subscribe(() => {
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

  private subscribeToBridgeDomainModal(): void {
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

  private subscribeToSubnetsModal(): void {
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

  public importBridgeDomainsConfig(): void {
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
