import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import {
  SubjectPaginationResponse,
  V2AppCentricSubjectsService,
  Subject,
  Filter,
  FilterPaginationResponse,
  V2AppCentricFiltersService,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { SubjectModalDto } from 'src/app/models/appcentric/subject-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { NameValidator } from 'src/app/validators/name-validator';

@Component({
  selector: 'app-subject-modal',
  templateUrl: './subject-modal.component.html',
  // styleUrls: ['./subject-modal.component.css'],
})
export class SubjectModalComponent implements OnInit {
  public isLoading = false;
  public modalMode: ModalMode;
  public form: FormGroup;
  public submitted: boolean;
  public tenantId: string;
  @Input() public contractId: string;
  public subjects: SubjectPaginationResponse;
  public tableComponentDto = new TableComponentDto();
  public perPage = 20;

  private addFilterModalSubscription: Subscription;
  private subjectEditModalSubscription: Subscription;

  public filters: Filter[];
  public selectedFilter: Filter;
  public subjectId: string;
  public filterTableData: FilterPaginationResponse;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [];

  public config: TableConfig<any> = {
    description: 'Subject filters',
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
    private subjectsService: V2AppCentricSubjectsService,
    private router: Router,
    private tableContextService: TableContextService,
    private filterService: V2AppCentricFiltersService,
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
    this.getFiltertableData();
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('subjectModal');
    this.reset();
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('subjectModal') as SubjectModalDto);
    const subject = dto.subject;

    this.modalMode = dto.modalMode;
    if (this.modalMode === ModalMode.Edit) {
      this.subjectId = subject.id;
      this.getFiltertableData();
      this.getFilters();
    } else {
      this.form.controls.name.enable();
      this.form.controls.applyBothDirections.setValue(true);
      this.form.controls.reverseFilterPorts.setValue(true);
    }

    if (subject !== undefined) {
      this.form.controls.name.setValue(subject.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(subject.description);
      this.form.controls.alias.setValue(subject.alias);
      this.form.controls.applyBothDirections.setValue(subject.applyBothDirections);
      this.form.controls.reverseFilterPorts.setValue(subject.reverseFilterPorts);
      this.form.controls.globalAlias.setValue(subject.globalAlias);
    }
    this.ngx.resetModalData('subjectModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('subjectModal');
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      alias: ['', Validators.compose([Validators.maxLength(100)])],
      description: ['', Validators.compose([Validators.maxLength(500)])],
      applyBothDirections: [null],
      reverseFilterPorts: [null],
      globalAlias: ['', Validators.compose([Validators.maxLength(100)])],
    });
  }

  private createSubjects(subject: Subject): void {
    this.subjectsService.createSubject({ subject }).subscribe(
      () => {
        this.closeModal();
      },
      () => {},
    );
  }

  private updateSubject(subject: Subject): void {
    subject.name = null;
    subject.tenantId = null;
    subject.contractId = null;
    this.subjectsService
      .updateSubject({
        uuid: this.subjectId,
        subject,
      })
      .subscribe(() => this.closeModal());
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { name, description, alias, applyBothDirections, reverseFilterPorts, globalAlias } = this.form.value;

    const tenantId = this.tenantId;

    const subject = {
      name,
      description,
      alias,
      tenantId,
      applyBothDirections,
      reverseFilterPorts,
      globalAlias,
    } as Subject;

    subject.contractId = this.contractId;

    if (this.modalMode === ModalMode.Edit) {
      this.updateSubject(subject);
    } else {
      this.createSubjects(subject);
    }
  }

  public getFilters(): void {
    this.isLoading = true;
    this.filterService
      .findAllFilter({
        filter: [`tenantId||eq||${this.tenantId}`],
        page: 1,
        perPage: 1000,
      })
      .subscribe(
        data => {
          const allFilters = data.data;
          const usedFilters = this.filterTableData.data;
          const usedFilterIds = usedFilters.map(filter => filter.id);
          this.filters = allFilters.filter(filter => !usedFilterIds.includes(filter.id));
        },
        () => {
          this.filters = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public getFiltertableData() {
    this.isLoading = true;
    this.subjectsService
      .findOneSubject({
        uuid: this.subjectId,
        relations: 'filters',
      })
      .subscribe(
        data => {
          const filterPagResponse = {} as FilterPaginationResponse;
          filterPagResponse.count = data.filters.length;
          filterPagResponse.page = 1;
          filterPagResponse.pageCount = 1;
          filterPagResponse.total = data.filters.length;
          filterPagResponse.data = data.filters;
          this.filterTableData = filterPagResponse;
        },
        () => {
          this.filters = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public addFilter() {
    this.isLoading = true;
    this.subjectsService
      .addFilterToSubjectSubject({
        filterId: this.selectedFilter.id,
        subjectId: this.subjectId,
      })
      .subscribe(
        () => {},
        () => {},
        () => {
          this.isLoading = false;
          this.getFiltertableData();
          this.getFilters();
          this.selectedFilter = undefined;
        },
      );
  }

  public removeFilter(filter: Filter) {
    this.isLoading = true;
    const modalDto = new YesNoModalDto('Remove filter', `Are you sure you want to remove filter ${filter.name}?`);
    const onConfirm = () => {
      this.subjectsService
        .removeFilterFromSubjectSubject({
          subjectId: this.subjectId,
          filterId: filter.id,
        })
        .subscribe(
          () => this.getFiltertableData(),
          () => (this.filterTableData = null),
          () => {
            this.isLoading = false;
            this.getFilters();
          },
        );
    };
    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }
}
