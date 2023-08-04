import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Contract, GetManyContractResponseDto, V2AppCentricContractsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { ContractModalDto } from 'src/app/models/appcentric/contract-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { TableContextService } from 'src/app/services/table-context.service';

@Component({
  selector: 'app-contract',
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.css'],
})
export class ContractComponent implements OnInit {
  public ModalMode = ModalMode;
  public currentContractPage = 1;
  public perPage = 20;
  public contracts = {} as GetManyContractResponseDto;
  public tableComponentDto = new TableComponentDto();
  private contractModalSubscription: Subscription;
  public tenantId: string;
  private subjectModalSubscription: Subscription;

  public isLoading = false;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [];

  public config: TableConfig<any> = {
    description: 'Contracts',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Alias', property: 'alias' },
      { name: 'Description', property: 'description' },
      { name: 'Scope', property: 'scope' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(
    private contractService: V2AppCentricContractsService,
    private tableContextService: TableContextService,
    private ngx: NgxSmartModalService,
    private router: Router,
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
    this.getContracts();
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getContracts(event);
  }

  public getContracts(event?): void {
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
    this.contractService
      .getManyContract({
        filter: [`tenantId||eq||${this.tenantId}`, eventParams],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe(
        data => {
          this.contracts = data;
        },
        () => {
          this.contracts = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public deleteContract(contract: Contract): void {
    if (contract.deletedAt) {
      this.contractService.deleteOneContract({ id: contract.id }).subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.getContracts(params);
        } else {
          this.getContracts();
        }
      });
    } else {
      this.contractService
        .softDeleteOneContract({
          id: contract.id,
        })
        .subscribe(() => {
          const params = this.tableContextService.getSearchLocalStorage();
          const { filteredResults } = params;

          // if filtered results boolean is true, apply search params in the
          // subsequent get call
          if (filteredResults) {
            this.getContracts(params);
          } else {
            this.getContracts();
          }
        });
    }
  }

  public restoreContract(contract: Contract): void {
    if (!contract.deletedAt) {
      return;
    }

    this.contractService
      .restoreOneContract({
        id: contract.id,
      })
      .subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.getContracts(params);
        } else {
          this.getContracts();
        }
      });
  }

  public openContractModal(modalMode: ModalMode, contract?: Contract): void {
    const dto = new ContractModalDto();

    dto.modalMode = modalMode;

    if (modalMode === ModalMode.Edit) {
      dto.contract = contract;
    }

    this.subscribeToContractModal();
    this.ngx.setModalData(dto, 'contractModal');
    this.ngx.getModal('contractModal').open();
  }

  private subscribeToContractModal(): void {
    this.contractModalSubscription = this.ngx.getModal('contractModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('contractModal');
      this.contractModalSubscription.unsubscribe();
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.getContracts(params);
      } else {
        this.getContracts();
      }
    });
  }

  public importContractsConfig(contract: Contract[]): void {
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
