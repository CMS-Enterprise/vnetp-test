import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { V2AppCentricL3outsService, L3Out, V2AppCentricVrfsService, GetManyL3OutResponseDto, GetManyVrfResponseDto } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { AdvancedSearchAdapter } from 'src/app/common/advanced-search/advanced-search.adapter';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { L3OutsModalDto } from 'src/app/models/appcentric/l3-outs-model-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-l3-outs',
  templateUrl: './l3-outs.component.html',
  styleUrls: ['./l3-outs.component.css'],
})
export class L3OutsComponent implements OnInit {
  public ModalMode = ModalMode;
  public currentL3OutsPage = 1;
  public perPage = 20;
  public l3Outs = {} as GetManyL3OutResponseDto;
  public tableComponentDto = new TableComponentDto();
  public l3OutsModalSubscription: Subscription;
  public tenantId: string;
  public vrfs: GetManyVrfResponseDto;

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
    advancedSearchAdapter.setServiceName('V2AppCentricL3outsService');
    this.config.advancedSearchAdapter = advancedSearchAdapter;

    const match = this.router.routerState.snapshot.url.match(
      /tenant-select\/edit\/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}/,
    );
    if (match) {
      const uuid = match[0].split('/')[2];
      this.tenantId = uuid;
    }
  }

  ngOnInit(): void {
    this.getL3Outs();
    this.getVrfs();
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
      .getManyL3Out({
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
      this.l3OutService.deleteOneL3Out({ id: l3Out.id }).subscribe(() => {
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
        .softDeleteOneL3Out({
          id: l3Out.id,
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
      .restoreOneL3Out({
        id: l3Out.id,
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

  public subscribeToL3OutsModal(): void {
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

  sanitizeData(entities: any) {
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
      if (key === 'ipAddress' && val !== '') {
        obj[key] = String(val).trim();
      }
      if (key === 'tenantName') {
        obj.tenantId = this.tenantId;
        delete obj[key];
      }
      if (key === 'vrfName') {
        obj[key] = ObjectUtil.getObjectId(val as string, this.vrfs.data);
        obj.vrfId = obj[key];
        delete obj[key];
      }
    });
    return obj;
  };

  public importL3Outs(event): void {
    const modalDto = new YesNoModalDto(
      'Import L3Outs',
      `Are you sure you would like to import ${event.length} L3 Out${event.length > 1 ? 's' : ''}?`,
    );

    const onConfirm = () => {
      const dto = this.sanitizeData(event);
      this.l3OutService.createManyL3Out({ createManyL3OutDto: { bulk: dto } }).subscribe(
        () => {},
        () => {},
        () => {
          this.getL3Outs();
        },
      );
    };

    const onClose = () => {
      this.getL3Outs();
      this.getVrfs();
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm, onClose);
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
      .getManyVrf({
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

  public navigateToManageL3Out(l3Out: L3Out): void {
    this.router.navigate([`/appcentric/${this.tenantId}/l3-out-management/${l3Out.id}`], { queryParamsHandling: 'merge' });
  }
}
