import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import {
  BridgeDomain,
  BridgeDomainPaginationResponse,
  L3Out,
  L3OutPaginationResponse,
  V2AppCentricBridgeDomainsService,
  V2AppCentricL3outsService,
  V2AppCentricVrfsService,
  Vrf,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
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
  public bridgeDomains = {} as BridgeDomainPaginationResponse;
  public tableComponentDto = new TableComponentDto();
  private bridgeDomainModalSubscription: Subscription;
  private subnetsModalSubscription: Subscription;
  public tenantId: string;
  public vrfs: Vrf[];
  public l3Outs: L3Out[];

  public isLoading = false;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [];

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
    private vrfService: V2AppCentricVrfsService,
    private l3OutsService: V2AppCentricL3outsService,
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
    this.getBridgeDomains();
    this.getVrfs();
    this.getL3Outs();
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
      if (propertyName) {
        eventParams = `${propertyName}||cont||${searchText}`;
      }
    }
    this.bridgeDomainService
      .findAllBridgeDomain({
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
      this.bridgeDomainService.removeBridgeDomain({ uuid: bridgeDomain.id }).subscribe(() => {
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
        .updateBridgeDomain({
          uuid: bridgeDomain.id,
          bridgeDomain: { deleted: true } as BridgeDomain,
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
      .updateBridgeDomain({
        uuid: bridgeDomain.id,
        bridgeDomain: { deleted: false } as BridgeDomain,
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

  public importBridgeDomainsConfig(bridgeDomain: BridgeDomain[]): void {
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

  public getVrfs(): void {
    this.isLoading = true;
    this.vrfService
      .findAllVrf({
        filter: [`tenantId||eq||${this.tenantId}`],
      })
      .subscribe(
        data => {
          this.vrfs = data.data;
        },
        () => {
          this.vrfs = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public getL3Outs(): void {
    this.isLoading = true;
    this.l3OutsService
      .findAllL3Out({
        filter: [`tenantId||eq||${this.tenantId}`],
      })
      .subscribe(
        data => {
          this.l3Outs = data.data;
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
