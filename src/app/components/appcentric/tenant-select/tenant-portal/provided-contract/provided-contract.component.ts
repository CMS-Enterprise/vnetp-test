import { Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  Contract,
  V2AppCentricEndpointGroupsService,
  V2AppCentricContractsService,
  GetManyContractResponseDto,
  V2AppCentricEndpointSecurityGroupsService,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-provided-contract',
  templateUrl: './provided-contract.component.html',
  // styleUrls: ['./provided-contracts.component.css'],
})
export class ProvidedContractComponent implements OnInit, OnChanges {
  @Input() public endpointGroupId: string;
  @Input() public endpointSecurityGroupId: string;
  public contractTableData: GetManyContractResponseDto;
  public contracts: Contract[];
  public selectedContract: Contract;
  public mode;

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
    private endpointSecurityGroupService: V2AppCentricEndpointSecurityGroupsService,
    private contractsService: V2AppCentricContractsService,
    private ngx: NgxSmartModalService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (this.router.routerState.snapshot.url.includes('endpoint-security-group')) {
      this.mode = 'esg';
      this.getContracts();
      this.getEsgProvidedContracts();
    } else {
      this.mode = 'epg';
      this.getContracts();
      this.getEpgProvidedContracts();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.mode === 'epg') {
      if (
        changes.endpointGroupId &&
        !changes.endpointGroupId.firstChange &&
        changes.endpointGroupId.currentValue !== changes.endpointGroupId.previousValue
      ) {
        this.getContracts();
        this.getEpgProvidedContracts();
        this.clearSelectedContract();
      }
    } else if (this.mode === 'esg') {
      if (
        changes.endpointSecurityGroupId &&
        !changes.endpointSecurityGroupId.firstChange &&
        changes.endpointSecurityGroupId.currentValue !== changes.endpointSecurityGroupId.previousValue
      ) {
        this.getContracts();
        this.getEsgProvidedContracts();
        this.clearSelectedContract();
      }
    }
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getEpgProvidedContracts();
  }

  public addEpgProvidedContract(): void {
    this.endpointGroupsService
      .addProvidedContractToEndpointGroupEndpointGroup({
        endpointGroupId: this.endpointGroupId,
        contractId: this.selectedContract.id,
      })
      .subscribe(() => this.getEpgProvidedContracts());
  }

  public removeEpgProvidedContract(contract: Contract): void {
    const modalDto = new YesNoModalDto('Remove Contract', `Are you sure you want to remove provided contract ${contract.name}?`);
    const onConfirm = () => {
      this.endpointGroupsService
        .removeProvidedContractToEndpointGroupEndpointGroup({
          endpointGroupId: this.endpointGroupId,
          contractId: contract.id,
        })
        .subscribe(() => this.getEpgProvidedContracts());
    };
    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  public getEpgProvidedContracts(): void {
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

  public addEsgContract(): void {
    this.endpointSecurityGroupService
      .addProvidedContractToEndpointSecurityGroupEndpointSecurityGroup({
        endpointSecurityGroupId: this.endpointSecurityGroupId,
        contractId: this.selectedContract.id,
      })
      .subscribe(() => this.getProvidedContracts());
  }

  public removeEsgContract(contract: Contract): void {
    const modalDto = new YesNoModalDto('Remove Contract', `Are you sure you want to remove provided contract ${contract.name}?`);
    const onConfirm = () => {
      this.endpointSecurityGroupService
        .removeProvidedContractToEndpointSecurityGroupEndpointSecurityGroup({
          endpointSecurityGroupId: this.endpointSecurityGroupId,
          contractId: contract.id,
        })
        .subscribe(() => this.getProvidedContracts());
    };
    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  public getEsgProvidedContracts(): void {
    this.endpointSecurityGroupService
      .getOneEndpointSecurityGroup({
        id: this.endpointSecurityGroupId,
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

  private sanitizeData(entities) {
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
      if (key === 'providedContractName') {
        obj.contractId = ObjectUtil.getObjectId(val as string, this.contracts);
        delete obj[key];
      }
      if (key === 'endpointGroupName') {
        obj.endpointGroupId = this.endpointGroupId;
        delete obj[key];
      }
      if (key === 'endpointSecurityGroupName') {
        obj.endpointSecurityGroupId = this.endpointSecurityGroupId;
        delete obj[key];
      }
      if (key === 'tenantName') {
        obj.tenantId = this.tenantId;
        delete obj[key];
      }
    });
    return obj;
  };

  public importProvidedContractRelation(event) {
    if (this.mode === 'epg') {
      this.importProvidedContractEpgRelation(event);
    } else {
      this.importProvidedContractEsgRelation(event);
    }
  }

  public importProvidedContractEpgRelation(event): void {
    const modalDto = new YesNoModalDto(
      'Import Provided Contracts',
      `Are you sure you would like to import ${event.length} Provided Contract${event.length > 1 ? 's' : ''}?`,
    );

    const onConfirm = () => {
      const dto = this.sanitizeData(event);
      this.endpointGroupsService
        .addManyProvidedContractsToEndpointGroupEndpointGroup({ endpointGroupId: `${this.endpointGroupId}`, body: dto })
        .subscribe(
          () => {},
          () => {},
          () => {
            this.getEpgProvidedContracts();
          },
        );
    };
    const onClose = () => {
      this.getEpgProvidedContracts();
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm, onClose);
  }

  public importProvidedContractEsgRelation(event): void {
    const modalDto = new YesNoModalDto(
      'Import Provided Contracts',
      `Are you sure you would like to import ${event.length} Provided Contract${event.length > 1 ? 's' : ''}?`,
    );

    const onConfirm = () => {
      const dto = this.sanitizeData(event);
      dto.map(relation => {
        this.endpointSecurityGroupService.addProvidedContractToEndpointSecurityGroupEndpointSecurityGroup(relation).subscribe(
          () => {},
          () => {},
          () => {
            this.getEsgProvidedContracts();
          },
        );
      });
    };
    const onClose = () => {
      this.getEsgProvidedContracts();
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm, onClose);
  }

  public getProvidedContracts() {
    if (this.mode === 'epg') {
      this.getEpgProvidedContracts();
    } else {
      this.getEsgProvidedContracts();
    }
  }

  public addContract() {
    if (this.mode === 'epg') {
      this.addEpgProvidedContract();
    } else {
      this.addEsgContract();
    }
  }

  public removeContract(contract) {
    if (this.mode === 'epg') {
      this.removeEpgProvidedContract(contract);
    } else {
      this.removeEsgContract(contract);
    }
  }
}
