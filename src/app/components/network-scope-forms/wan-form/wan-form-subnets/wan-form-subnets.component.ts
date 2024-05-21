import { Component, TemplateRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModalMode } from '../../../../models/other/modal-mode';
import { TableComponentDto } from '../../../../models/other/table-component-dto';
import {
  BridgeDomain,
  GetManyWanFormSubnetResponseDto,
  V1NetworkScopeFormsWanFormService,
  V1NetworkScopeFormsWanFormSubnetService,
  V1NetworkSubnetsService,
  V2AppCentricAppCentricSubnetsService,
  Vlan,
  WanForm,
  WanFormSubnet,
} from '../../../../../../client';
import { TableConfig } from '../../../../common/table/table.component';
import { SearchColumnConfig } from '../../../../common/search-bar/search-bar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { TableContextService } from '../../../../services/table-context.service';
import { WanFormSubnetModalDto } from '../../../../models/network-scope-forms/wan-form-subnet-modal.dto';

@Component({
  selector: 'app-wan-form-subnets',
  templateUrl: './wan-form-subnets.component.html',
  styleUrl: './wan-form-subnets.component.css',
})
export class WanFormSubnetsComponent {
  public wanForm: WanForm;
  public wanFormSubnets: GetManyWanFormSubnetResponseDto;
  public isLoading = false;
  public tableComponentDto = new TableComponentDto();
  public wanFormId: string;
  public ModalMode = ModalMode;
  public perPage = 20;

  public subnetVlans = new Map<string, Vlan>();
  public subnetBridgeDomains = new Map<string, BridgeDomain>();

  private modalSubscription: Subscription;

  public dcsMode: string;

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
    { propertyName: 'name', displayName: 'Name' },
    { displayName: 'Description', propertyName: 'description' },
    { displayName: 'VRF/Zone', propertyName: 'vrfName' },
    { displayName: 'Environment', propertyName: 'environment' },
  ];

  constructor(
    private wanFormSubnetService: V1NetworkScopeFormsWanFormSubnetService,
    private route: ActivatedRoute,
    private router: Router,
    private ngx: NgxSmartModalService,
    private tableContextService: TableContextService,
    private wanFormService: V1NetworkScopeFormsWanFormService,
    private netcentricSubnetService: V1NetworkSubnetsService,
    private appcentricSubnetService: V2AppCentricAppCentricSubnetsService,
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.wanForm = navigation.extras.state.data;
    }
  }

  ngOnInit(): void {
    this.wanFormId = this.route.snapshot.params.id;
    this.dcsMode = this.route.snapshot.data.mode;
    this.getWanFormSubnets();
    if (!this.wanForm) {
      this.wanFormService.getOneWanForm({ id: this.wanFormId }).subscribe(data => {
        this.wanForm = data;
        this.getChildren();
      });
    } else {
      this.getChildren();
    }
  }

  public onTableEvent(event): void {
    this.tableComponentDto = event;
    this.getWanFormSubnets(event);
  }

  public openModal(modalMode: ModalMode, wanFormSubnet?: WanFormSubnet): void {
    const dto = new WanFormSubnetModalDto();

    dto.modalMode = modalMode;
    dto.wanFormId = this.wanFormId;
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
        filter: [`wanFormId||eq||${this.wanFormId}`, eventParams],
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

  navigateToWanForm(): void {
    const currentQueryParams = this.route.snapshot.queryParams;

    this.router.navigate([`/${this.dcsMode}/wan-form`], { queryParams: currentQueryParams });
  }

  getChildren(): void {
    if (this.dcsMode === 'netcentric') {
      this.getSubnetVlans();
    } else {
      this.getSubnetBridgeDomains();
    }
  }

  getSubnetBridgeDomains(): void {
    this.appcentricSubnetService
      .getManyAppCentricSubnet({ filter: [`tenantId||eq||${this.wanForm.tenantId}`], join: ['bridgeDomain'] })
      .subscribe((data: any) => {
        data.forEach(subnet => {
          this.subnetBridgeDomains.set(subnet.id, subnet.bridgeDomain);
        });
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
