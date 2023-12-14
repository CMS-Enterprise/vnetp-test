import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import {
  V2AppCentricSubjectsService,
  Subject,
  Filter,
  V2AppCentricFiltersService,
  GetManySubjectResponseDto,
  GetManyFilterResponseDto,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { SubjectModalDto } from 'src/app/models/appcentric/subject-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import ObjectUtil from 'src/app/utils/ObjectUtil';
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
  public form: UntypedFormGroup;
  public submitted: boolean;
  @Input() public tenantId: string;
  @Input() public contractId: string;
  public subjects: GetManySubjectResponseDto;
  public tableComponentDto = new TableComponentDto();
  public perPage = 20;

  public filters: Filter[];
  public selectedFilter: Filter;
  public subjectId: string;
  public filterTableData: GetManyFilterResponseDto;

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
    private formBuilder: UntypedFormBuilder,
    private ngx: NgxSmartModalService,
    private subjectsService: V2AppCentricSubjectsService,
    private filterService: V2AppCentricFiltersService,
  ) {}

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
    this.subjectsService.createOneSubject({ subject }).subscribe(
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
      .updateOneSubject({
        id: this.subjectId,
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
      .getManyFilter({
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
      .getOneSubject({
        id: this.subjectId,
        relations: ['filters'],
      })
      .subscribe(
        data => {
          const filterPagResponse = {} as GetManyFilterResponseDto;
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
      if (key === 'filterName') {
        obj.filterId = ObjectUtil.getObjectId(val as string, this.filters);
        delete obj[key];
      }
      if (key === 'subjectName') {
        obj.subjectId = this.subjectId;
        delete obj[key];
      }
      if (key === 'tenantName') {
        obj.tenantId = this.tenantId;
        delete obj[key];
      }
    });
    return obj;
  };

  public importSubjectFilterRelation(event): void {
    const dto = this.sanitizeData(event);
    dto.map(relation => {
      this.subjectsService.addFilterToSubjectSubject(relation).subscribe(
        data => {},
        () => {},
        () => {
          this.getFiltertableData();
        },
      );
    });
  }
}
