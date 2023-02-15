import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Contract, ContractPaginationResponse, V2AppCentricContractsService, V2AppCentricEndpointGroupsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-consumed-contracts',
  templateUrl: './consumed-contracts.component.html',
  styleUrls: ['./consumed-contracts.component.css'],
})
export class ConsumedContractsComponent implements OnInit {
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

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getConsumedContracts(event);
  }

  public addContract(): void {
    this.endpointGroupsService
      .addConsumedContractToEndpointGroupEndpointGroup({
        endpointGroupId: this.endpointGroupId,
        contractId: this.selectedContract.id,
      })
      .subscribe(data => this.getConsumedContracts());
  }

  public removeContract(contract: Contract): void {
    const modalDto = new YesNoModalDto('Remove Contract', `Are you sure you want to remove consumed contract ${contract.name}?`);
    const onConfirm = () => {
      this.endpointGroupsService
        .removeConsumedContractToEndpointGroupEndpointGroup({
          endpointGroupId: this.endpointGroupId,
          contractId: contract.id,
        })
        .subscribe(data => this.getConsumedContracts());
    };
    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  public getConsumedContracts(event?): void {
    this.endpointGroupsService
      .findOneEndpointGroup({
        uuid: this.endpointGroupId,
        relations: 'consumedContracts',
      })
      .subscribe(data => {
        const contractPagResponse = {} as ContractPaginationResponse;
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
      .findAllContract({
        filter: [`tenantId||eq||${this.tenantId}`],
      })
      .subscribe(
        data => (this.contracts = data.data),
        err => (this.contracts = null),
      );
  }
}
