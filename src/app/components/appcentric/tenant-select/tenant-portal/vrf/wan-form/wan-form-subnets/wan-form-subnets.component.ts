import { Component, Input, OnInit, ViewChild, TemplateRef, Output, EventEmitter } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import {
  GetManyWanFormSubnetResponseDto,
  Vlan,
  BridgeDomain,
  V1NetworkScopeFormsWanFormSubnetService,
  V1NetworkSubnetsService,
  V2AppCentricAppCentricSubnetsService,
  WanFormSubnet,
  WanForm,
} from 'client';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { ApplicationMode } from 'src/app/models/other/application-mode-enum';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import { WanFormSubnetModalDto } from 'src/app/models/network-scope-forms/wan-form-subnet-modal.dto';

@Component({
  selector: 'app-wan-form-subnets',
  templateUrl: './wan-form-subnets.component.html',
  styleUrls: ['./wan-form-subnets.component.css'],
})
export class WanFormSubnetsComponent implements OnInit {
  @Input() wanForm: WanForm;
  @Output() back = new EventEmitter<void>();
  public wanFormSubnets: GetManyWanFormSubnetResponseDto;
  public isLoading = false;
  public tableComponentDto = new TableComponentDto();
  public ModalMode = ModalMode;
  public perPage = 20;

  public subnetVlans = new Map<string, Vlan>();
  public subnetBridgeDomains = new Map<string, BridgeDomain>();

  private modalSubscription: Subscription;

  public applicationMode: ApplicationMode;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
  @ViewChild('vrfNameTemplate') vrfNameTemplate: TemplateRef<any>;
  @ViewChild('expandableRows') expandableRows: TemplateRef<any>;

  public config: TableConfig<any> = {
    description: 'External Routes',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Description', property: 'description' },
      { name: 'VRF/Zone', template: () => this.vrfNameTemplate },
      { name: 'Environment', property: 'environment' },
      { name: '', template: () => this.actionsTemplate },
    ],
    expandableRows: () => this.expandableRows,
    hideAdvancedSearch: true,
  };

  public searchColumns: SearchColumnConfig[] = [
    { displayName: 'Description', propertyName: 'description' },
    { displayName: 'VRF/Zone', propertyName: 'vrfName' },
    { displayName: 'Environment', propertyName: 'environment' },
  ];

  constructor(
    private wanFormSubnetService: V1NetworkScopeFormsWanFormSubnetService,
    private ngx: NgxSmartModalService,
    private tableContextService: TableContextService,
    private netcentricSubnetService: V1NetworkSubnetsService,
    private appcentricSubnetService: V2AppCentricAppCentricSubnetsService,
  ) {}

  ngOnInit(): void {
    this.getWanFormSubnets();
    this.getChildren();
  }

  public onTableEvent(event): void {
    this.tableComponentDto = event;
    this.getWanFormSubnets(event);
  }

  public openModal(modalMode: ModalMode, wanFormSubnet?: WanFormSubnet): void {
    const dto = new WanFormSubnetModalDto();

    dto.modalMode = modalMode;
    dto.wanForm = this.wanForm;
    dto.wanFormSubnet = wanFormSubnet;

    this.subscribeToModal();
    this.ngx.setModalData(dto, 'wanFormSubnetModal');
    this.ngx.getModal('wanFormSubnetModal').open();
  }

  private subscribeToModal(): void {
    this.modalSubscription = this.ngx.getModal('wanFormSubnetModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('wanFormSubnetModal');
      this.modalSubscription.unsubscribe();
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      if (filteredResults) {
        this.getWanFormSubnets(params);
      } else {
        this.getWanFormSubnets();
      }
    });
  }

  public getWanFormSubnets(event?) {
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
    this.wanFormSubnetService
      .getManyWanFormSubnet({
        filter: [`wanFormId||eq||${this.wanForm.id}`, eventParams],
        join: ['netcentricSubnet', 'appcentricSubnet'],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe(
        data => {
          this.wanFormSubnets = data;
        },
        () => {
          this.wanFormSubnets = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public deleteWanFormSubnet(wanFormSubnet: WanFormSubnet): void {
    this.isLoading = true;
    if (wanFormSubnet.deletedAt) {
      this.wanFormSubnetService
        .deleteOneWanFormSubnet({
          id: wanFormSubnet.id,
        })
        .subscribe(
          () => {
            this.getWanFormSubnets();
          },
          () => {
            this.isLoading = false;
          },
          () => {
            this.isLoading = false;
          },
        );
    } else {
      this.wanFormSubnetService.softDeleteOneWanFormSubnet({ id: wanFormSubnet.id }).subscribe(
        () => {
          this.getWanFormSubnets();
        },
        () => {
          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
        },
      );
    }
  }

  public restoreWanFormSubnet(wanFormSubnet: WanFormSubnet): void {
    this.isLoading = true;
    this.wanFormSubnetService.restoreOneWanFormSubnet({ id: wanFormSubnet.id }).subscribe(
      () => {
        this.getWanFormSubnets();
      },
      () => {
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      },
    );
  }

  getChildren(): void {
    if (this.applicationMode === 'netcentric') {
      this.getSubnetVlans();
    } else {
      this.getSubnetBridgeDomains();
    }
  }

  getSubnetBridgeDomains(): void {
    this.appcentricSubnetService
      .getManyAppCentricSubnet({
        filter: [`tenantId||eq||${this.wanForm.tenantId}`],
        join: ['bridgeDomain'],
      })
      .subscribe({
        next: (data: any) => {
          data.forEach(subnet => {
            this.subnetBridgeDomains.set(subnet.id, subnet.bridgeDomain);
          });
        },
        error: () => {
          console.log(this.wanForm.tenantId);
        },
      });
  }

  getSubnetVlans(): void {
    this.netcentricSubnetService.getSubnetsByDatacenterIdSubnet({ datacenterId: this.wanForm.datacenterId }).subscribe(data => {
      data.forEach(subnet => {
        this.subnetVlans.set(subnet.id, subnet.vlan);
      });
    });
  }
}
