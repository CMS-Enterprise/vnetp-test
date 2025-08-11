import { Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { Contract, GetManyContractResponseDto, V2AppCentricContractsService, V2AppCentricEndpointGroupsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-consumed-contract',
  templateUrl: './consumed-contract.component.html',
  standalone: false,
})
export class ConsumedContractComponent implements OnInit, OnChanges {
  @Input() public endpointGroupId: string;
  public contractTableData: GetManyContractResponseDto;
  public contracts: Contract[];
  public selectedContract: Contract;

  public perPage = 20;
  public tableComponentDto = new TableComponentDto();

  @Input() public tenantId;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [];

  public config: TableConfig<any> = {
    description: 'Consumed Contracts',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Alias', property: 'alias' },
      { name: 'Description', property: 'description' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(
    private endpointGroupsService: V2AppCentricEndpointGroupsService,
    private contractsService: V2AppCentricContractsService,
    private ngx: NgxSmartModalService,
  ) {}

  ngOnInit(): void {
    this.getContracts();
    this.getConsumedContracts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.endpointGroupId &&
      !changes.endpointGroupId.firstChange &&
      changes.endpointGroupId.currentValue !== changes.endpointGroupId.previousValue
    ) {
      this.getContracts();
      this.getConsumedContracts();
      this.clearSelectedContract();
    }
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getConsumedContracts();
  }

  public addContract(): void {
    this.endpointGroupsService
      .addConsumedContractToEndpointGroupEndpointGroup({
        endpointGroupId: this.endpointGroupId,
        contractId: this.selectedContract.id,
      })
      .subscribe(() => this.getConsumedContracts());
  }

  public removeContract(contract: Contract): void {
    const modalDto = new YesNoModalDto('Remove Contract', `Are you sure you want to remove consumed contract ${contract.name}?`);
    const onConfirm = () => {
      this.endpointGroupsService
        .removeConsumedContractToEndpointGroupEndpointGroup({
          endpointGroupId: this.endpointGroupId,
          contractId: contract.id,
        })
        .subscribe(() => this.getConsumedContracts());
    };
    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  public getConsumedContracts(): void {
    this.endpointGroupsService
      .getOneEndpointGroup({
        id: this.endpointGroupId,
        relations: ['consumedContracts'],
      })
      .subscribe(data => {
        const contractPagResponse = {} as GetManyContractResponseDto;
        contractPagResponse.count = data.consumedContracts.length;
        contractPagResponse.page = 1;
        contractPagResponse.pageCount = 1;
        contractPagResponse.total = data.consumedContracts.length;
        contractPagResponse.data = data.consumedContracts;
        this.contractTableData = contractPagResponse;
      });
  }

  public getContracts(): void {
    this.contractsService
      .getManyContract({
        filter: [`tenantId||eq||${this.tenantId}`],
        page: 1,
        perPage: 1000,
      })
      .subscribe(
        data => {
          const allContracts = data.data;
          const usedFilters = this.contractTableData?.data.map(contract => contract.id);
          this.contracts = allContracts.filter(contract => !usedFilters?.includes(contract.id));
        },
        () => (this.contracts = null),
      );
  }

  public clearSelectedContract(): void {
    if (this.selectedContract) {
      this.selectedContract = null;
    }
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
      if (key === 'consumedContractName') {
        obj.contractId = ObjectUtil.getObjectId(val as string, this.contracts);
        delete obj[key];
      }
      if (key === 'endpointGroupName') {
        obj.endpointGroupId = this.endpointGroupId;
        delete obj[key];
      }
      if (key === 'tenantName') {
        obj.tenantId = this.tenantId;
        delete obj[key];
      }
    });
    return obj;
  };

  public importConsumedContractEpgRelation(event): void {
    const modalDto = new YesNoModalDto(
      'Import Consumed Contracts',
      `Are you sure you would like to import ${event.length} Consumed Contract${event.length > 1 ? 's' : ''}?`,
    );

    const onConfirm = () => {
      const dto = this.sanitizeData(event);
      dto.map(relation => {
        this.endpointGroupsService.addConsumedContractToEndpointGroupEndpointGroup(relation).subscribe(
          () => {},
          () => {},
          () => {
            this.getConsumedContracts();
          },
        );
      });
    };

    const onClose = () => {
      this.getConsumedContracts();
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm, onClose);
  }
}
