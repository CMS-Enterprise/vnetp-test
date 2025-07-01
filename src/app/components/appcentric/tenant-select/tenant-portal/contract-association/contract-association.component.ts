import { Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  Contract,
  GetManyContractResponseDto,
  V2AppCentricContractsService,
  V2AppCentricEndpointGroupsService,
  V2AppCentricEndpointSecurityGroupsService,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

export type ContractType = 'consumed' | 'provided' | 'intra';

@Component({
  selector: 'app-contract-association',
  templateUrl: './contract-association.component.html',
  styleUrls: ['./contract-association.component.css'],
})
export class ContractAssociationComponent implements OnInit, OnChanges {
  @Input() public endpointGroupId: string;
  @Input() public endpointSecurityGroupId: string;
  @Input() public contractType: ContractType = 'consumed';
  @Input() public tenantId: string;

  public contractTableData: GetManyContractResponseDto;
  public contracts: Contract[];
  public selectedContract: Contract;
  public mode: 'epg' | 'esg';

  public perPage = 20;
  public tableComponentDto = new TableComponentDto();

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [];

  public config: TableConfig<any>;

  constructor(
    private endpointGroupsService: V2AppCentricEndpointGroupsService,
    private endpointSecurityGroupsService: V2AppCentricEndpointSecurityGroupsService,
    private contractsService: V2AppCentricContractsService,
    private ngx: NgxSmartModalService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.setupConfig();

    if (this.router.routerState.snapshot.url.includes('endpoint-security-group')) {
      this.mode = 'esg';
      this.getContracts();
      this.getEsgContracts();
    } else {
      this.mode = 'epg';
      this.getContracts();
      this.getEpgContracts();
    }
  }

  setupConfig(): void {
    const contractTypeCapitalized = this.contractType.charAt(0).toUpperCase() + this.contractType.slice(1);
    this.config = {
      description: `${contractTypeCapitalized} Contracts`,
      columns: [
        { name: 'Name', property: 'name' },
        { name: 'Alias', property: 'alias' },
        { name: 'Description', property: 'description' },
        { name: '', template: () => this.actionsTemplate },
      ],
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.contractType && !changes.contractType.firstChange) {
      this.setupConfig();
    }

    if (this.mode === 'epg') {
      if (
        changes.endpointGroupId &&
        !changes.endpointGroupId.firstChange &&
        changes.endpointGroupId.currentValue !== changes.endpointGroupId.previousValue
      ) {
        this.getContracts();
        this.getEpgContracts();
        this.clearSelectedContract();
      }
    }
    if (this.mode === 'esg') {
      if (
        changes.endpointSecurityGroupId &&
        !changes.endpointSecurityGroupId.firstChange &&
        changes.endpointSecurityGroupId.currentValue !== changes.endpointSecurityGroupId.previousValue
      ) {
        this.getContracts();
        this.getEsgContracts();
        this.clearSelectedContract();
      }
    }
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getContracts();
  }

  public addEpgContract(): void {
    if (this.contractType === 'consumed') {
      this.endpointGroupsService
        .addConsumedContractToEndpointGroupEndpointGroup({
          endpointGroupId: this.endpointGroupId,
          contractId: this.selectedContract.id,
        })
        .subscribe(() => this.getEpgContracts());
    } else if (this.contractType === 'provided') {
      this.endpointGroupsService
        .addProvidedContractToEndpointGroupEndpointGroup({
          endpointGroupId: this.endpointGroupId,
          contractId: this.selectedContract.id,
        })
        .subscribe(() => this.getEpgContracts());
    } else if (this.contractType === 'intra') {
      this.endpointGroupsService
        .addIntraContractToEndpointGroupEndpointGroup({
          endpointGroupId: this.endpointGroupId,
          contractId: this.selectedContract.id,
        })
        .subscribe(() => this.getEpgContracts());
    }
  }

  public removeEpgContract(contract: Contract): void {
    const modalDto = new YesNoModalDto(
      'Remove Contract',
      `Are you sure you want to remove ${this.contractType} contract ${contract.name}?`,
    );
    const onConfirm = () => {
      if (this.contractType === 'consumed') {
        this.endpointGroupsService
          .removeConsumedContractToEndpointGroupEndpointGroup({
            endpointGroupId: this.endpointGroupId,
            contractId: contract.id,
          })
          .subscribe(() => this.getEpgContracts());
      } else if (this.contractType === 'provided') {
        this.endpointGroupsService
          .removeProvidedContractToEndpointGroupEndpointGroup({
            endpointGroupId: this.endpointGroupId,
            contractId: contract.id,
          })
          .subscribe(() => this.getEpgContracts());
      } else if (this.contractType === 'intra') {
        this.endpointGroupsService
          .removeIntraContractToEndpointGroupEndpointGroup({
            endpointGroupId: this.endpointGroupId,
            contractId: contract.id,
          })
          .subscribe(() => this.getEpgContracts());
      }
    };
    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  public getEpgContracts(): void {
    let relations: string[];

    if (this.contractType === 'consumed') {
      relations = ['consumedContracts'];
    } else if (this.contractType === 'provided') {
      relations = ['providedContracts'];
    } else if (this.contractType === 'intra') {
      relations = ['intraContracts'];
    }

    this.endpointGroupsService
      .getOneEndpointGroup({
        id: this.endpointGroupId,
        relations,
      })
      .subscribe(data => {
        const contractPagResponse = {} as GetManyContractResponseDto;
        let contracts = [];

        if (this.contractType === 'consumed' && data.consumedContracts) {
          contracts = data.consumedContracts;
        } else if (this.contractType === 'provided' && data.providedContracts) {
          contracts = data.providedContracts;
        } else if (this.contractType === 'intra' && data.intraContracts) {
          contracts = data.intraContracts;
        }

        contractPagResponse.count = contracts.length;
        contractPagResponse.page = 1;
        contractPagResponse.pageCount = 1;
        contractPagResponse.total = contracts.length;
        contractPagResponse.data = contracts;
        this.contractTableData = contractPagResponse;
      });
  }

  public addEsgContract(): void {
    if (this.contractType === 'consumed') {
      this.endpointSecurityGroupsService
        .addConsumedContractToEndpointSecurityGroupEndpointSecurityGroup({
          endpointSecurityGroupId: this.endpointSecurityGroupId,
          contractId: this.selectedContract.id,
        })
        .subscribe(() => this.getEsgContracts());
    } else if (this.contractType === 'provided') {
      this.endpointSecurityGroupsService
        .addProvidedContractToEndpointSecurityGroupEndpointSecurityGroup({
          endpointSecurityGroupId: this.endpointSecurityGroupId,
          contractId: this.selectedContract.id,
        })
        .subscribe(() => this.getEsgContracts());
    } else if (this.contractType === 'intra') {
      this.endpointSecurityGroupsService
        .addIntraContractToEndpointSecurityGroupEndpointSecurityGroup({
          endpointSecurityGroupId: this.endpointSecurityGroupId,
          contractId: this.selectedContract.id,
        })
        .subscribe(() => this.getEsgContracts());
    }
  }

  public removeEsgContract(contract: Contract): void {
    const modalDto = new YesNoModalDto(
      'Remove Contract',
      `Are you sure you want to remove ${this.contractType} contract ${contract.name}?`,
    );
    const onConfirm = () => {
      if (this.contractType === 'consumed') {
        this.endpointSecurityGroupsService
          .removeConsumedContractToEndpointSecurityGroupEndpointSecurityGroup({
            endpointSecurityGroupId: this.endpointSecurityGroupId,
            contractId: contract.id,
          })
          .subscribe(() => this.getEsgContracts());
      } else if (this.contractType === 'provided') {
        this.endpointSecurityGroupsService
          .removeProvidedContractToEndpointSecurityGroupEndpointSecurityGroup({
            endpointSecurityGroupId: this.endpointSecurityGroupId,
            contractId: contract.id,
          })
          .subscribe(() => this.getEsgContracts());
      } else if (this.contractType === 'intra') {
        this.endpointSecurityGroupsService
          .removeIntraContractToEndpointSecurityGroupEndpointSecurityGroup({
            endpointSecurityGroupId: this.endpointSecurityGroupId,
            contractId: contract.id,
          })
          .subscribe(() => this.getEsgContracts());
      }
    };
    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  public getEsgContracts(): void {
    let relations: string[];

    if (this.contractType === 'consumed') {
      relations = ['consumedContracts'];
    } else if (this.contractType === 'provided') {
      relations = ['providedContracts'];
    } else if (this.contractType === 'intra') {
      relations = ['intraContracts'];
    }

    this.endpointSecurityGroupsService
      .getOneEndpointSecurityGroup({
        id: this.endpointSecurityGroupId,
        relations,
      })
      .subscribe(data => {
        const contractPagResponse = {} as GetManyContractResponseDto;
        let contracts = [];

        if (this.contractType === 'consumed' && data.consumedContracts) {
          contracts = data.consumedContracts;
        } else if (this.contractType === 'provided' && data.providedContracts) {
          contracts = data.providedContracts;
        } else if (this.contractType === 'intra' && data.intraContracts) {
          contracts = data.intraContracts;
        }

        contractPagResponse.count = contracts.length;
        contractPagResponse.page = 1;
        contractPagResponse.pageCount = 1;
        contractPagResponse.total = contracts.length;
        contractPagResponse.data = contracts;
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
      if (key === 'consumedContractName' || key === 'providedContractName' || key === 'intraContractName') {
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

  public importContractRelation(event): void {
    if (this.contractType === 'intra') {
      // Bulk import not supported for intra contracts
      return;
    }

    if (this.mode === 'epg') {
      this.importContractEpgRelation(event);
    } else {
      this.importContractEsgRelation(event);
    }
  }

  public importContractEpgRelation(event): void {
    const contractTypeCapitalized = this.contractType.charAt(0).toUpperCase() + this.contractType.slice(1);

    const modalDto = new YesNoModalDto(
      `Import ${contractTypeCapitalized} Contracts`,
      `Are you sure you would like to import ${event.length} ${contractTypeCapitalized} Contract${event.length > 1 ? 's' : ''}?`,
    );

    const onConfirm = () => {
      const dto = this.sanitizeData(event);

      if (this.contractType === 'consumed') {
        this.endpointGroupsService
          .addManyConsumedContractsToEndpointGroupEndpointGroup({
            endpointGroupId: `${this.endpointGroupId}`,
            body: dto,
          })
          .subscribe({
            complete: () => {
              this.getEpgContracts();
            },
          });
      } else if (this.contractType === 'provided') {
        this.endpointGroupsService
          .addManyProvidedContractsToEndpointGroupEndpointGroup({
            endpointGroupId: `${this.endpointGroupId}`,
            body: dto,
          })
          .subscribe({
            complete: () => {
              this.getEpgContracts();
            },
          });
      }
    };

    const onClose = () => {
      this.getEpgContracts();
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm, onClose);
  }

  public importContractEsgRelation(event): void {
    const contractTypeCapitalized = this.contractType.charAt(0).toUpperCase() + this.contractType.slice(1);

    const modalDto = new YesNoModalDto(
      `Import ${contractTypeCapitalized} Contracts`,
      `Are you sure you would like to import ${event.length} ${contractTypeCapitalized} Contract${event.length > 1 ? 's' : ''}?`,
    );

    const onConfirm = () => {
      const dto = this.sanitizeData(event);

      if (this.contractType === 'consumed') {
        this.endpointSecurityGroupsService
          .addManyConsumedContractsToEndpointSecurityGroupEndpointSecurityGroup({
            endpointSecurityGroupId: `${this.endpointSecurityGroupId}`,
            body: dto,
          })
          .subscribe({
            complete: () => {
              this.getEsgContracts();
            },
          });
      } else if (this.contractType === 'provided') {
        this.endpointSecurityGroupsService
          .addManyProvidedContractsToEndpointSecurityGroupEndpointSecurityGroup({
            endpointSecurityGroupId: `${this.endpointSecurityGroupId}`,
            body: dto,
          })
          .subscribe({
            complete: () => {
              this.getEsgContracts();
            },
          });
      }
    };

    const onClose = () => {
      this.getEsgContracts();
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm, onClose);
  }

  public addContract(): void {
    if (this.mode === 'epg') {
      this.addEpgContract();
    } else {
      this.addEsgContract();
    }
  }

  public removeContract(contract: Contract): void {
    if (this.mode === 'epg') {
      this.removeEpgContract(contract);
    } else {
      this.removeEsgContract(contract);
    }
  }

  public getAllContracts(): void {
    if (this.mode === 'epg') {
      this.getEpgContracts();
    } else {
      this.getEsgContracts();
    }
  }
}
