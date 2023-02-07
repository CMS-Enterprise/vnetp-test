import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { SubjectPaginationResponse, V2AppCentricSubjectsService, Subject } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { ContractModalDto } from 'src/app/models/appcentric/contract-modal-dto';
import { SubjectModalDto } from 'src/app/models/appcentric/subject-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import { NameValidator } from 'src/app/validators/name-validator';

@Component({
  selector: 'app-subject-modal',
  templateUrl: './subject-modal.component.html',
  styleUrls: ['./subject-modal.component.css'],
})
export class SubjectModalComponent implements OnInit {
  public isLoading = false;
  public modalMode: ModalMode;
  public form: FormGroup;
  public submitted: boolean;
  public tenantId: string;
  public contractId: string;
  public subjects: SubjectPaginationResponse;
  public tableComponentDto = new TableComponentDto();
  public perPage = 20;

  private addFilterModalSubscription: Subscription;
  private subjectEditModalSubscription: Subscription;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [];

  public config: TableConfig<any> = {
    description: 'Subjects',
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
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const match = event.url.match(/\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\//);
        if (match) {
          this.tenantId = match[1];
        }
      }
    });
  }

  ngOnInit(): void {
    this.buildForm();
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getSubjects(event);
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('subjectsModal');
    this.reset();
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('subjectModal') as ContractModalDto);

    this.modalMode = dto.modalMode;
    this.contractId = dto.contract.id;

    this.ngx.resetModalData('subjectsModal');
    this.getSubjects();
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('subjectsModal');
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
        this.getSubjects();
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

    this.createSubjects(subject);
  }

  public getSubjects(event?): void {
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
    this.subjectsService
      .findAllSubject({
        filter: [`contractId||eq||${this.contractId}`, eventParams],
      })
      .subscribe(
        data => (this.subjects = data),
        () => (this.subjects = null),
      );
  }

  public removeSubject(subject: Subject) {
    if (subject.deletedAt) {
      this.subjectsService
        .removeSubject({
          uuid: subject.id,
        })
        .subscribe(() => {
          const params = this.tableContextService.getSearchLocalStorage();
          const { filteredResults } = params;
          if (filteredResults) {
            this.getSubjects(params);
          } else {
            this.getSubjects();
          }
        });
    } else {
      this.subjectsService
        .updateSubject({
          uuid: subject.id,
          subject: { deleted: true } as Subject,
        })
        .subscribe(() => {
          const params = this.tableContextService.getSearchLocalStorage();
          const { filteredResults } = params;
          if (filteredResults) {
            this.getSubjects(params);
          } else {
            this.getSubjects();
          }
        });
    }
  }

  public restoreSubject(subject: Subject): void {
    if (!subject.deletedAt) {
      return;
    }

    this.subjectsService
      .updateSubject({
        uuid: subject.id,
        subject: { deleted: false } as Subject,
      })
      .subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.getSubjects(params);
        } else {
          this.getSubjects();
        }
      });
  }

  public openAddFilterModal(subject: Subject): void {
    const dto = new SubjectModalDto();

    dto.subject = subject;

    this.subscribeToAddFilterModal();
    this.ngx.setModalData(dto, 'addFilterModal');
    this.ngx.getModal('addFilterModal').open();
  }

  private subscribeToAddFilterModal(): void {
    this.addFilterModalSubscription = this.ngx.getModal('addFilterModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('addFilterModal');
      this.addFilterModalSubscription.unsubscribe();
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.getSubjects(params);
      } else {
        this.getSubjects();
      }
    });
  }

  public openSubjectEditModal(subject: Subject): void {
    this.subscribeToSubjectEditModal();
    this.ngx.setModalData(subject, 'subjectEditModal');
    this.ngx.getModal('subjectEditModal').open();
  }

  private subscribeToSubjectEditModal(): void {
    this.subjectEditModalSubscription = this.ngx.getModal('subjectEditModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('subjectEditModal');
      this.subjectEditModalSubscription.unsubscribe();
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.getSubjects(params);
      } else {
        this.getSubjects();
      }
    });
  }
}
