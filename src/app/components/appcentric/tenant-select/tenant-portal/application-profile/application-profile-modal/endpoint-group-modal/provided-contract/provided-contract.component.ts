import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ContractPaginationResponse, Contract, V2AppCentricEndpointGroupsService, V2AppCentricContractsService } from 'client';
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
export class ProvidedContractComponent implements OnInit {
  @Input() public endpointGroupId: string;
  public contractTableData: ContractPaginationResponse;
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

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getProvidedContracts(event);
  }

  public addContract(): void {
    this.endpointGroupsService
      .addProvidedContractToEndpointGroupEndpointGroup({
        endpointGroupId: this.endpointGroupId,
        contractId: this.selectedContract.id,
      })
      .subscribe(data => this.getProvidedContracts());
  }

  public removeContract(contract: Contract): void {
    const modalDto = new YesNoModalDto('Remove Contract', `Are you sure you want to remove provided contract ${contract.name}?`);
    const onConfirm = () => {
      this.endpointGroupsService
        .removeProvidedContractToEndpointGroupEndpointGroup({
          endpointGroupId: this.endpointGroupId,
          contractId: contract.id,
        })
        .subscribe(data => this.getProvidedContracts());
    };
    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  public getProvidedContracts(event?): void {
    this.endpointGroupsService
      .findOneEndpointGroup({
        uuid: this.endpointGroupId,
        relations: 'providedContracts',
      })
      .subscribe(data => {
        const contractPagResponse = {} as ContractPaginationResponse;
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
      .findAllContract({
        filter: [`tenantId||eq||${this.tenantId}`],
      })
      .subscribe(
        data => {
          const allContracts = data.data;
          const usedFilters = this.contractTableData?.data.map(contract => contract.id);
          this.contracts = allContracts.filter(contract => !usedFilters.includes(contract.id));
        },
        err => (this.contracts = null),
      );
  }
}
