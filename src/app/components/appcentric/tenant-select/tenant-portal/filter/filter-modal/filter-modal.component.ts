import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import {
  FilterEntry,
  Filter,
  V2AppCentricFilterEntriesService,
  FilterEntryEtherTypeEnum,
  FilterEntryArpFlagEnum,
  FilterEntryIpProtocolEnum,
  V2AppCentricFiltersService,
  GetManyFilterEntryResponseDto,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { FilterModalDto } from 'src/app/models/appcentric/filter-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { NameValidator } from 'src/app/validators/name-validator';
import { FilterEntryModalDto } from '../../../../../../models/appcentric/filter-entry-modal.dto';
import ObjectUtil from 'src/app/utils/ObjectUtil';

@Component({
  selector: 'app-filter-modal',
  templateUrl: './filter-modal.component.html',
  styleUrls: ['./filter-modal.component.css'],
})
export class FilterModalComponent implements OnInit {
  public ModalMode = ModalMode;
  public isLoading = false;
  public modalMode: ModalMode;
  public form: UntypedFormGroup;
  public submitted: boolean;
  @Input() public tenantId: string;
  public filterId: string;
  public filterEntries: GetManyFilterEntryResponseDto;
  public tableComponentDto = new TableComponentDto();
  public perPage = 20;

  public etherTypeOptions = Object.keys(FilterEntryEtherTypeEnum);
  public arpFlagOptions = Object.keys(FilterEntryArpFlagEnum);
  public ipProtocolOptions = Object.keys(FilterEntryIpProtocolEnum);

  public filter: Filter;

  private filterEntryEditModalSubscription: Subscription;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
  @ViewChild('sourcePortTemplate') sourcePortTemplate: TemplateRef<any>;
  @ViewChild('destinationPortTemplate') destinationPortTemplate: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [];

  public config: TableConfig<any> = {
    description: 'FilterEntries',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Alias', property: 'alias' },
      { name: 'Ether Type', property: 'etherType' },
      { name: 'Ip Protocol', property: 'ipProtocol' },
      { name: 'Stateful', property: 'stateful' },
      { name: 'Source Port Range', template: () => this.sourcePortTemplate },
      { name: 'Destination Port Range', template: () => this.destinationPortTemplate },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(
    private formBuilder: UntypedFormBuilder,
    private ngx: NgxSmartModalService,
    private filterService: V2AppCentricFiltersService,
    private filterEntriesService: V2AppCentricFilterEntriesService,
    private tableContextService: TableContextService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getFilterEntries(event);
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('filterModal');
    this.reset();
    this.buildForm();
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('filterModal') as FilterModalDto);

    this.modalMode = dto.modalMode;

    if (this.modalMode === ModalMode.Edit) {
      this.filterId = dto.filter.id;
      this.form.controls.name.disable();
      this.getFilterEntries();
    } else {
      this.form.controls.name.enable();
    }

    const filter = dto?.filter;

    if (filter !== undefined) {
      this.form.controls.name.setValue(filter.name);
      this.form.controls.description.setValue(filter.description);
      this.form.controls.alias.setValue(filter.alias);
    }
    this.ngx.resetModalData('filterModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('filterModal');
    this.buildForm();
  }

  public getFilterEntries(event?): void {
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
    this.filterEntriesService
      .getManyFilterEntry({
        filter: [`filterId||eq||${this.filterId}`, eventParams],
        perPage: 1000,
        page: 1,
      })
      .subscribe(
        data => (this.filterEntries = data),
        () => (this.filterEntries = null),
      );
  }

  public removeFilterEntry(filterEntry: FilterEntry) {
    if (filterEntry.deletedAt) {
      const modalDto = new YesNoModalDto(
        'Delete Filter Entry',
        `Are you sure you want to permanently delete this filter entry ${filterEntry.name}?`,
      );
      const onConfirm = () => {
        this.filterEntriesService
          .deleteOneFilterEntry({
            id: filterEntry.id,
          })
          .subscribe(() => {
            const params = this.tableContextService.getSearchLocalStorage();
            const { filteredResults } = params;
            if (filteredResults) {
              this.getFilterEntries(params);
            } else {
              this.getFilterEntries();
            }
          });
      };
      SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
    } else {
      const modalDto = new YesNoModalDto(
        'Delete Filter Entry',
        `Are you sure you want to soft delete this filter entry ${filterEntry.name}?`,
      );
      const onConfirm = () => {
        this.filterEntriesService
          .softDeleteOneFilterEntry({
            id: filterEntry.id,
          })
          .subscribe(() => {
            const params = this.tableContextService.getSearchLocalStorage();
            const { filteredResults } = params;
            if (filteredResults) {
              this.getFilterEntries(params);
            } else {
              this.getFilterEntries();
            }
          });
      };
      SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
    }
  }

  public restoreFilterEntry(filterEntry: FilterEntry): void {
    if (!filterEntry.deletedAt) {
      return;
    }
    this.filterEntriesService
      .restoreOneFilterEntry({
        id: filterEntry.id,
      })
      .subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;
        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.getFilterEntries(params);
        } else {
          this.getFilterEntries();
        }
      });
  }

  public openFilterEntryModal(modalMode: ModalMode, filterEntry?: FilterEntry): void {
    const dto = new FilterEntryModalDto();
    dto.modalMode = modalMode;
    dto.filterId = this.filterId;

    if (modalMode === ModalMode.Edit) {
      dto.filterEntry = filterEntry;
    }

    this.subscribeToFilterEntryModal();
    this.ngx.setModalData(dto, 'filterEntryModal');
    this.ngx.getModal('filterEntryModal').open();
  }

  private subscribeToFilterEntryModal(): void {
    this.filterEntryEditModalSubscription = this.ngx.getModal('filterEntryModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('filterEntryModal');
      this.filterEntryEditModalSubscription.unsubscribe();
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.getFilterEntries(params);
      } else {
        this.getFilterEntries();
      }
    });
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      alias: ['', Validators.compose([Validators.maxLength(100)])],
      description: ['', Validators.compose([Validators.maxLength(500)])],
    });
  }

  private createFilter(filter: Filter): void {
    this.filterService.createOneFilter({ filter }).subscribe(
      () => {
        this.closeModal();
      },
      () => {},
    );
  }

  private editFilter(filter: Filter): void {
    filter.name = null;
    this.filterService
      .updateOneFilter({
        id: this.filterId,
        filter,
      })
      .subscribe(
        () => {
          this.closeModal();
        },
        () => {},
      );
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { name, description, alias } = this.form.value;
    const tenantId = this.tenantId;
    const filter = {
      name,
      description,
      alias,
      tenantId,
    } as Filter;

    if (this.modalMode === ModalMode.Create) {
      this.createFilter(filter);
    } else {
      delete filter.tenantId;
      delete filter.name;
      this.editFilter(filter);
    }
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
      if (key === 'tenantName') {
        obj.tenantId = this.tenantId;
        delete obj[key];
      }
      if (key === 'filterName') {
        obj.filterId = this.filterId;
        delete obj[key];
      }
    });
    return obj;
  };

  public importFilterEntries(event): void {
    const dto = this.sanitizeData(event);
    this.filterEntriesService.createManyFilterEntry({ createManyFilterEntryDto: { bulk: dto } }).subscribe(
      data => {},
      () => {},
      () => {
        this.getFilterEntries();
      },
    );
  }
}
