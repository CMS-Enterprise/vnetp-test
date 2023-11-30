import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { AppCentricSubnet, GetManyAppCentricSubnetResponseDto, V2AppCentricAppCentricSubnetsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { AppcentricSubnetDto } from 'src/app/models/appcentric/appcentric-subnet-dto';
import { BridgeDomainDto } from 'src/app/models/appcentric/bridge-domain-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import { NameValidator } from 'src/app/validators/name-validator';
import { IpAddressCidrValidator } from 'src/app/validators/network-form-validators';

@Component({
  selector: 'app-subnets-modal',
  templateUrl: './subnets-modal.component.html',
  styleUrls: ['./subnets-modal.component.css'],
})
export class SubnetsModalComponent implements OnInit {
  public isLoading = false;
  public ModalMode = ModalMode;
  public modalMode: ModalMode;
  public form: UntypedFormGroup;
  public submitted: boolean;
  @Input() public tenantId: string;
  public bridgeDomainId: string;
  public subnets: GetManyAppCentricSubnetResponseDto;
  public tableComponentDto = new TableComponentDto();
  public perPage = 20;
  private subnetsEditModalSubscription: Subscription;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [];

  public config: TableConfig<any> = {
    description: 'Subnets',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Alias', property: 'alias' },
      { name: 'Description', property: 'description' },
      { name: 'Gateway IP', property: 'gatewayIp' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(
    private formBuilder: UntypedFormBuilder,
    private ngx: NgxSmartModalService,
    private subnetsService: V2AppCentricAppCentricSubnetsService,
    private tableContextService: TableContextService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getSubnets(event);
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('subnetsModal');
    this.reset();
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('subnetsModal') as BridgeDomainDto);

    this.modalMode = dto.modalMode;
    this.bridgeDomainId = dto.bridgeDomain.id;

    this.ngx.resetModalData('subnetsModal');

    this.getSubnets();
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('subnetsModal');
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      alias: ['', Validators.compose([Validators.maxLength(100)])],
      description: ['', Validators.compose([Validators.maxLength(500)])],
      gatewayIp: ['', Validators.compose([Validators.required, IpAddressCidrValidator])],
      treatAsVirtualIpAddress: [null],
      primaryIpAddress: ['', Validators.required],
      advertisedExternally: [null],
      preferred: [null],
      sharedBetweenVrfs: [null],
      ipDataPlaneLearning: [null],
    });
  }

  public getSubnets(event?): void {
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
    this.subnetsService
      .getManyAppCentricSubnet({
        filter: [`bridgeDomainId||eq||${this.bridgeDomainId}`, eventParams],
      })
      .subscribe(
        data => (this.subnets = data),
        () => (this.subnets = null),
      );
  }

  public removeSubnet(subnet: AppCentricSubnet) {
    if (subnet.deletedAt) {
      this.subnetsService
        .deleteOneAppCentricSubnet({
          id: subnet.id,
        })
        .subscribe(() => {
          const params = this.tableContextService.getSearchLocalStorage();
          const { filteredResults } = params;
          if (filteredResults) {
            this.getSubnets(params);
          } else {
            this.getSubnets();
          }
        });
    } else {
      this.subnetsService
        .softDeleteOneAppCentricSubnet({
          id: subnet.id,
        })
        .subscribe(() => {
          const params = this.tableContextService.getSearchLocalStorage();
          const { filteredResults } = params;
          if (filteredResults) {
            this.getSubnets(params);
          } else {
            this.getSubnets();
          }
        });
    }
  }

  public restoreSubnet(subnet: AppCentricSubnet): void {
    if (!subnet.deletedAt) {
      return;
    }

    this.subnetsService
      .restoreOneAppCentricSubnet({
        id: subnet.id,
      })
      .subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.getSubnets(params);
        } else {
          this.getSubnets();
        }
      });
  }

  public openSubnetsEditModal(modalMode: ModalMode, subnet?: AppCentricSubnet): void {
    const dto = new AppcentricSubnetDto();
    dto.modalMode = modalMode;
    dto.subnet = subnet;

    this.subscribeToSubnetsEditModal();
    this.ngx.setModalData(dto, 'subnetsEditModal');
    this.ngx.getModal('subnetsEditModal').open();
  }

  private subscribeToSubnetsEditModal(): void {
    this.subnetsEditModalSubscription = this.ngx.getModal('subnetsEditModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('subnetsEditModal');
      this.subnetsEditModalSubscription.unsubscribe();
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.getSubnets(params);
      } else {
        this.getSubnets();
      }
    });
  }
}
