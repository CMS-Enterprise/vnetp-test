import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { V2AppCentricContractsService, Contract, V2AppCentricSubjectsService, Subject, GetManySubjectResponseDto } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { ContractModalDto } from 'src/app/models/appcentric/contract-modal-dto';
import { SubjectModalDto } from 'src/app/models/appcentric/subject-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { NameValidator } from 'src/app/validators/name-validator';

@Component({
  selector: 'app-contract-modal',
  templateUrl: './contract-modal.component.html',
  styleUrls: ['./contract-modal.component.css'],
})
export class ContractModalComponent implements OnInit {
  public isLoading = false;
  public ModalMode = ModalMode;
  public modalMode: ModalMode;
  public contractId: string;
  public form: UntypedFormGroup;
  public submitted: boolean;
  @Input() tenantId;

  public tableComponentDto = new TableComponentDto();
  public subjects: GetManySubjectResponseDto;
  private subjectModalSubscription: Subscription;
  public perPage = 20;

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
    private formBuilder: UntypedFormBuilder,
    private ngx: NgxSmartModalService,
    private contractService: V2AppCentricContractsService,
    private subjectsService: V2AppCentricSubjectsService,
    private tableContextService: TableContextService,
  ) {}

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
    this.ngx.close('contractModal');
    this.reset();
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('contractModal') as ContractModalDto);

    this.modalMode = dto.modalMode;
    if (this.modalMode === ModalMode.Edit) {
      this.contractId = dto.contract.id;
      this.getSubjects();
    } else {
      this.form.controls.name.enable();
    }

    const contract = dto.contract;
    if (contract !== undefined) {
      this.form.controls.name.setValue(contract.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(contract.description);
      this.form.controls.alias.setValue(contract.alias);
    }
    this.ngx.resetModalData('contractModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('contractModal');
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      alias: ['', Validators.compose([Validators.maxLength(100)])],
      description: ['', Validators.compose([Validators.maxLength(500)])],
    });
  }

  private createContract(contract: Contract): void {
    this.contractService.createOneContract({ contract }).subscribe(
      () => {
        this.closeModal();
      },
      () => {},
    );
  }

  private editContract(contract: Contract): void {
    delete contract.name;
    delete contract.tenantId;
    this.contractService
      .updateOneContract({
        id: this.contractId,
        contract,
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
    const contract = {
      name,
      description,
      alias,
      tenantId,
    } as Contract;

    if (this.modalMode === ModalMode.Create) {
      this.createContract(contract);
    } else {
      this.editContract(contract);
    }
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
      .getManySubject({
        page: 1,
        perPage: 1000,
        filter: [`contractId||eq||${this.contractId}`, eventParams],
      })
      .subscribe(
        data => {
          this.subjects = data;
        },
        () => (this.subjects = null),
      );
  }

  public removeSubject(subject: Subject) {
    if (subject.deletedAt) {
      const modalDto = new YesNoModalDto('Delete Subject', `Are you sure you want to permanently delete this subject ${subject.name}?`);
      const onConfirm = () => {
        this.subjectsService
          .deleteOneSubject({
            id: subject.id,
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
      };
      SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
    } else {
      const modalDto = new YesNoModalDto('Delete Subject', `Are you sure you want to soft delete this subject ${subject.name}?`);
      const onConfirm = () => {
        this.subjectsService
          .softDeleteOneSubject({
            id: subject.id,
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
      };
      SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
    }
  }

  public restoreSubject(subject: Subject): void {
    if (!subject.deletedAt) {
      return;
    }

    this.subjectsService
      .restoreOneSubject({
        id: subject.id,
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

  public openSubjectModal(modalMode: ModalMode, subject?: Subject): void {
    const dto = new SubjectModalDto();
    dto.modalMode = modalMode;
    if (dto.modalMode === ModalMode.Edit) {
      dto.subject = subject;
    }

    this.subscribeToSubjectModal();
    this.ngx.setModalData(dto, 'subjectModal');
    this.ngx.getModal('subjectModal').open();
  }

  private subscribeToSubjectModal(): void {
    this.subjectModalSubscription = this.ngx.getModal('subjectModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('subjectModal');
      this.subjectModalSubscription.unsubscribe();
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
      if (key === 'contractName') {
        obj.contractId = this.contractId;
        delete obj[key];
      }
    });
    return obj;
  };

  public importSubjects(event): void {
    const modalDto = new YesNoModalDto(
      'Import Subjects',
      `Are you sure you would like to import ${event.length} Subject${event.length > 1 ? 's' : ''}?`,
    );

    const onConfirm = () => {
      const dto = this.sanitizeData(event);
      this.subjectsService.createManySubject({ createManySubjectDto: { bulk: dto } }).subscribe(
        data => {},
        () => {},
        () => {
          this.getSubjects();
        },
      );
    };
    const onClose = () => {
      this.getSubjects();
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm, onClose);
  }
}
