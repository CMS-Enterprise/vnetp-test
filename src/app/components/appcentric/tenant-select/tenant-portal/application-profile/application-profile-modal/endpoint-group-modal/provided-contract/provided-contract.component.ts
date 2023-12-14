import { Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { Contract, V2AppCentricEndpointGroupsService, V2AppCentricContractsService, GetManyContractResponseDto } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-provided-contract',
  templateUrl: './provided-contract.component.html',
  // styleUrls: ['./provided-contracts.component.css'],
})
export class ProvidedContractComponent implements OnInit, OnChanges {
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
    description: 'Provided Contracts',
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
    this.getProvidedContracts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.endpointGroupId &&
      !changes.endpointGroupId.firstChange &&
      changes.endpointGroupId.currentValue !== changes.endpointGroupId.previousValue
    ) {
      this.getContracts();
      this.getProvidedContracts();
      this.clearSelectedContract();
    }
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getProvidedContracts();
  }

  public addContract(): void {
    this.endpointGroupsService
      .addProvidedContractToEndpointGroupEndpointGroup({
        endpointGroupId: this.endpointGroupId,
        contractId: this.selectedContract.id,
      })
      .subscribe(() => this.getProvidedContracts());
  }

  public removeContract(contract: Contract): void {
    const modalDto = new YesNoModalDto('Remove Contract', `Are you sure you want to remove provided contract ${contract.name}?`);
    const onConfirm = () => {
      this.endpointGroupsService
        .removeProvidedContractToEndpointGroupEndpointGroup({
          endpointGroupId: this.endpointGroupId,
          contractId: contract.id,
        })
        .subscribe(() => this.getProvidedContracts());
    };
    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  public getProvidedContracts(): void {
    this.endpointGroupsService
      .getOneEndpointGroup({
        id: this.endpointGroupId,
        relations: ['providedContracts'],
      })
      .subscribe(data => {
        const contractPagResponse = {} as GetManyContractResponseDto;
        contractPagResponse.count = data.providedContracts.length;
        contractPagResponse.page = 1;
        contractPagResponse.pageCount = 1;
        contractPagResponse.total = data.providedContracts.length;
        contractPagResponse.data = data.providedContracts;
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
}
