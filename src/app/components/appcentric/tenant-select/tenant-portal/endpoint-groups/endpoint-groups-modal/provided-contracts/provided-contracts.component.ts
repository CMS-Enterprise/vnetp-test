import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ContractPaginationResponse, Contract, V2AppCentricEndpointGroupsService, V2AppCentricContractsService } from 'client';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';

@Component({
  selector: 'app-provided-contracts',
  templateUrl: './provided-contracts.component.html',
  styleUrls: ['./provided-contracts.component.css'],
})
export class ProvidedContractsComponent implements OnInit {
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
    description: 'L3 Outs',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Alias', property: 'alias' },
      { name: 'Description', property: 'description' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(private endpointGroupsService: V2AppCentricEndpointGroupsService, private contractsService: V2AppCentricContractsService) {}

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
    this.endpointGroupsService
      .removeProvidedContractToEndpointGroupEndpointGroup({
        endpointGroupId: this.endpointGroupId,
        contractId: contract.id,
      })
      .subscribe(data => this.getProvidedContracts());
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
        data => (this.contracts = data.data),
        err => (this.contracts = null),
      );
  }
}
