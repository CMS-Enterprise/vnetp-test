import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { V2AppCentricL3outsService, L3OutPaginationResponse, L3Out, VrfPaginationResponse, V2AppCentricVrfsService, Vrf } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { AdvancedSearchAdapter } from 'src/app/common/advanced-search/advanced-search.adapter';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { L3OutsModalDto } from 'src/app/models/appcentric/l3-outs-model-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { TableContextService } from 'src/app/services/table-context.service';

@Component({
  selector: 'app-l3-outs',
  templateUrl: './l3-outs.component.html',
  styleUrls: ['./l3-outs.component.css'],
})
export class L3OutsComponent implements OnInit {
  public ModalMode = ModalMode;
  public currentL3OutsPage = 1;
  public perPage = 20;
  public l3Outs = {} as L3OutPaginationResponse;
  public tableComponentDto = new TableComponentDto();
  private l3OutsModalSubscription: Subscription;
  public tenantId: string;
  public vrfs: VrfPaginationResponse;

  public isLoading = false;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [
    { displayName: 'Alias', propertyName: 'alias', searchOperator: 'cont' },
    { displayName: 'Description', propertyName: 'description', searchOperator: 'cont' },
  ];

  public config: TableConfig<any> = {
    description: 'L3Outs',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Alias', property: 'alias' },
      { name: 'Description', property: 'description' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(
    private l3OutService: V2AppCentricL3outsService,
    private tableContextService: TableContextService,
    private ngx: NgxSmartModalService,
    private router: Router,
    private vrfService: V2AppCentricVrfsService,
  ) {
    const advancedSearchAdapter = new AdvancedSearchAdapter<L3Out>();
    advancedSearchAdapter.setService(this.l3OutService);
    this.config.advancedSearchAdapter = advancedSearchAdapter;

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const match = event.url.match(/tenant-select\/edit\/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}/);
        if (match) {
          const uuid = match[0].split('/')[2];
          this.tenantId = uuid;
        }
      }
    });
  }

  ngOnInit(): void {
    this.getL3Outs();
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getL3Outs(event);
  }

  public getL3Outs(event?): void {
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
    this.l3OutService
      .findAllL3Out({
        filter: [`tenantId||eq||${this.tenantId}`, eventParams],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe(
        data => {
          this.l3Outs = data;
        },
        () => {
          this.l3Outs = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public deleteL3Out(l3Out: L3Out): void {
    if (l3Out.deletedAt) {
      this.l3OutService.removeL3Out({ uuid: l3Out.id }).subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if l3Outed results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.getL3Outs(params);
        } else {
          this.getL3Outs();
        }
      });
    } else {
      this.l3OutService
        .softDeleteL3Out({
          uuid: l3Out.id,
        })
        .subscribe(() => {
          const params = this.tableContextService.getSearchLocalStorage();
          const { filteredResults } = params;

          // if l3Outed results boolean is true, apply search params in the
          // subsequent get call
          if (filteredResults) {
            this.getL3Outs(params);
          } else {
            this.getL3Outs();
          }
        });
    }
  }

  public restoreL3Out(l3Out: L3Out): void {
    if (!l3Out.deletedAt) {
      return;
    }

    this.l3OutService
      .restoreL3Out({
        uuid: l3Out.id,
      })
      .subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if l3Outed results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.getL3Outs(params);
        } else {
          this.getL3Outs();
        }
      });
  }

  public openL3OutsModal(modalMode: ModalMode, l3Out?: L3Out): void {
    const dto = new L3OutsModalDto();

    dto.modalMode = modalMode;

    if (modalMode === ModalMode.Edit) {
      dto.l3Out = l3Out;
    }

    this.getVrfs();

    this.subscribeToL3OutsModal();
    this.ngx.setModalData(dto, 'l3OutsModal');
    this.ngx.getModal('l3OutsModal').open();
  }

  private subscribeToL3OutsModal(): void {
    this.l3OutsModalSubscription = this.ngx.getModal('l3OutsModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('l3OutsModal');
      this.l3OutsModalSubscription.unsubscribe();
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if l3Outed results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.getL3Outs(params);
      } else {
        this.getL3Outs();
      }
    });
  }

  public importL3OutsConfig(l3Out: L3Out[]): void {
    // const tenantEnding = tenants.length > 1 ? 's' : '';
    // const modalDto = new YesNoModalDto(
    //   `Import Tier${tenantEnding}`,
    //   `Would you like to import ${tenants.length} tier${tenantEnding}?`,
    //   `Import Tier${tenantEnding}`,
    //   'Cancel',
    // );
    // const onConfirm = () => {
    //   this.tenantService
    //     .createManyTier({
    //       createManyTierDto: { bulk: this.sanitizeTiers(tiers) },
    //     })
    //     .subscribe(() => {
    //       this.getTiers();
    //     });
    // };
    // SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  public getVrfs(event?): void {
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
    this.vrfService
      .findAllVrf({
        filter: [`tenantId||eq||${this.tenantId}`, eventParams],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe(
        data => {
          this.vrfs = data;
        },
        () => {
          this.vrfs = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }
}
