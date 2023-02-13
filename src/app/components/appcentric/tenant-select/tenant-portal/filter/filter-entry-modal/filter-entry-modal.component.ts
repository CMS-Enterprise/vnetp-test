import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import {
  FilterEntryPaginationResponse,
  FilterEntry,
  V2AppCentricFilterEntriesService,
  FilterEntryEtherTypeEnum,
  FilterEntryArpFlagEnum,
  FilterEntryIpProtocolEnum,
  FilterEntryTcpFlagsEnum,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { FilterModalDto } from 'src/app/models/appcentric/filter-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import { NameValidator } from 'src/app/validators/name-validator';

@Component({
  selector: 'app-filter-entry-modal',
  templateUrl: './filter-entry-modal.component.html',
  styleUrls: ['./filter-entry-modal.component.css'],
})
export class FilterEntryModalComponent implements OnInit {
  public isLoading = false;
  public modalMode: ModalMode;
  public form: FormGroup;
  public submitted: boolean;
  public tenantId: string;
  public filterId: string;
  public filterEntries: FilterEntryPaginationResponse;
  public tableComponentDto = new TableComponentDto();
  public perPage = 20;

  public etherTypeOptions = Object.keys(FilterEntryEtherTypeEnum);
  public arpFlagOptions = Object.keys(FilterEntryArpFlagEnum);
  public ipProtocolOptions = Object.keys(FilterEntryIpProtocolEnum);
  public tcpFlagsOptions = Object.keys(FilterEntryTcpFlagsEnum).map(key => ({ value: key, label: key }));

  private filterEntryEditModalSubscription: Subscription;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [];

  public config: TableConfig<any> = {
    description: 'FilterEntries',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Alias', property: 'alias' },
      { name: 'Description', property: 'description' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
    private filterEntriesService: V2AppCentricFilterEntriesService,
    private router: Router,
    private tableContextService: TableContextService,
  ) {
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
    this.ngx.close('filterEntriesModal');
    this.reset();
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('filterEntryModal') as FilterModalDto);

    this.modalMode = dto.modalMode;
    this.filterId = dto.filter.id;

    this.ngx.resetModalData('filterEntriesModal');
    this.getFilterEntries();
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('filterEntriesModal');
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      alias: ['', Validators.compose([Validators.maxLength(100)])],
      description: ['', Validators.compose([Validators.maxLength(500)])],
      etherType: [null],
      arpFlag: [null],
      ipProtocol: [null],
      matchOnlyFragments: [null],
      sourceFromPort: ['', Validators.compose([Validators.min(0), Validators.max(65535)])],
      sourceToPort: ['', Validators.compose([Validators.min(0), Validators.max(65535)])],
      destinationFromPort: ['', Validators.compose([Validators.min(0), Validators.max(65535)])],
      destinationToPort: ['', Validators.compose([Validators.min(0), Validators.max(65535)])],
      tcpFlags: [null],
      stateful: [null],
    });
  }

  private createFilterEntries(filterEntry: FilterEntry): void {
    this.filterEntriesService.createFilterEntry({ filterEntry }).subscribe(
      () => {
        this.getFilterEntries();
        this.reset();
      },
      () => {},
    );
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const {
      name,
      description,
      alias,
      etherType,
      arpFlag,
      ipProtocol,
      sourceFromPort,
      sourceToPort,
      destinationFromPort,
      destinationToPort,
      stateful,
    } = this.form.value;

    let { matchOnlyFragments } = this.form.value;

    matchOnlyFragments = matchOnlyFragments === 'true';

    const tenantId = this.tenantId;
    const filterId = this.filterId;

    const filterEntry = {
      name,
      description,
      alias,
      tenantId,
      matchOnlyFragments,
      sourceFromPort,
      sourceToPort,
      destinationFromPort,
      destinationToPort,
      filterId,
      stateful,
    } as FilterEntry;

    filterEntry.etherType = FilterEntryEtherTypeEnum[etherType];
    filterEntry.arpFlag = FilterEntryArpFlagEnum[arpFlag];
    filterEntry.ipProtocol = FilterEntryIpProtocolEnum[ipProtocol];

    filterEntry.tcpFlags = this.form.get('tcpFlags').value;

    this.createFilterEntries(filterEntry);
  }

  onTcpFlagSelected(selected: any[]) {
    const tcpFlagControl = 'tcpFlags';
    const tcpFlags = this.form.controls[tcpFlagControl] as FormArray;
    const selectedValues = selected.map(item => item.value);
    tcpFlags.setValue(selectedValues);
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
      .findAllFilterEntry({
        filter: [`filterId||eq||${this.filterId}`, eventParams],
      })
      .subscribe(
        data => (this.filterEntries = data),
        () => (this.filterEntries = null),
      );
  }

  public removeFilterEntry(filterEntry: FilterEntry) {
    if (filterEntry.deletedAt) {
      this.filterEntriesService
        .removeFilterEntry({
          uuid: filterEntry.id,
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
    } else {
      this.filterEntriesService
        .softDeleteFilterEntry({
          uuid: filterEntry.id,
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
    }
  }

  public restoreFilterEntry(filterEntry: FilterEntry): void {
    if (!filterEntry.deletedAt) {
      return;
    }

    this.filterEntriesService
      .restoreFilterEntry({
        uuid: filterEntry.id,
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

  public openFilterEntryEditModal(filterEnry: FilterEntry): void {
    this.subscribeToFilterEntryEditModal();
    this.ngx.setModalData(filterEnry, 'filterEntryEditModal');
    this.ngx.getModal('filterEntryEditModal').open();
  }

  private subscribeToFilterEntryEditModal(): void {
    this.filterEntryEditModalSubscription = this.ngx.getModal('filterEntryEditModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('filterEntryEditModal');
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
}
