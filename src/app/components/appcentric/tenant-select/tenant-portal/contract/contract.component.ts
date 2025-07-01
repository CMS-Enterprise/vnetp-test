import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Contract, GetManyContractResponseDto, V2AppCentricContractsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { AdvancedSearchAdapter } from 'src/app/common/advanced-search/advanced-search.adapter';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { ContractModalDto } from 'src/app/models/appcentric/contract-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

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
  public contractModalSubscription: Subscription;
  public tenantId: string;

  public isLoading = false;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [
    { displayName: 'Alias', propertyName: 'alias', searchOperator: 'cont' },
    { displayName: 'Description', propertyName: 'description', searchOperator: 'cont' },
  ];

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
    const advancedSearchAdapter = new AdvancedSearchAdapter<Contract>();
    advancedSearchAdapter.setService(this.contractService);
    advancedSearchAdapter.setServiceName('V2AppCentricContractsService');
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

  private showConfirmationModal(title: string, message: string, onConfirm: () => void): void {
    const modalDto = new YesNoModalDto(title, message);

    const onConfirmWrapper = () => {
      onConfirm();
    };

    const onClose = () => {
      this.refreshContracts();
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirmWrapper, onClose);
  }

  private refreshContracts(): void {
    const params = this.tableContextService.getSearchLocalStorage();
    const { filteredResults } = params;

    if (filteredResults) {
      this.getContracts(params);
    } else {
      this.getContracts();
    }
  }

  public deleteContract(contract: Contract): void {
    const isHardDelete = contract.deletedAt;
    const title = isHardDelete ? 'Delete Contract' : 'Soft Delete Contract';
    const message = isHardDelete
      ? `Are you sure you want to delete ${contract.name}? This cannot be undone.`
      : `Are you sure you want to soft delete ${contract.name}? This can be undone.`;

    const onConfirm = () => {
      const deleteMethod = isHardDelete
        ? this.contractService.deleteOneContract({ id: contract.id })
        : this.contractService.softDeleteOneContract({ id: contract.id });

      deleteMethod.subscribe(() => {
        this.refreshContracts();
      });
    };

    this.showConfirmationModal(title, message, onConfirm);
  }

  public restoreContract(contract: Contract): void {
    if (!contract.deletedAt) {
      return;
    }

    const onConfirm = () => {
      this.contractService.restoreOneContract({ id: contract.id }).subscribe(() => {
        this.refreshContracts();
      });
    };

    this.showConfirmationModal('Restore Contract', `Are you sure you want to restore ${contract.name}?`, onConfirm);
  }

  public deprovisionContract(contract: Contract): void {
    const onConfirm = () => {
      this.contractService.deprovisionOneContract({ id: contract.id }).subscribe(() => {
        this.refreshContracts();
      });
    };

    this.showConfirmationModal('Deprovision Contract', `Are you sure you would like to deprovision ${contract.name}?`, onConfirm);
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

  public subscribeToContractModal(): void {
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

  public importContracts(event): void {
    const onConfirm = () => {
      const dto = this.sanitizeData(event);
      this.contractService.createManyContract({ createManyContractDto: { bulk: dto } }).subscribe({
        complete: () => {
          this.refreshContracts();
        },
      });
    };

    this.showConfirmationModal(
      'Import Contracts',
      `Are you sure you would like to import ${event.length} Contract${event.length > 1 ? 's' : ''}?`,
      onConfirm,
    );
  }
}
