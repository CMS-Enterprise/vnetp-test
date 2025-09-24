/* eslint-disable */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockImportExportComponent,
  MockNgxSmartModalComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { SubjectModalComponent } from './subject-modal.component';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { of, Subscription } from 'rxjs';
import { Filter, V2AppCentricSubjectsService, V2AppCentricVrfsService } from 'client';
import { By } from '@angular/platform-browser';
import { ModalMode } from 'src/app/models/other/modal-mode';

describe('SubjectModalComponent', () => {
  let component: SubjectModalComponent;
  let fixture: ComponentFixture<SubjectModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        SubjectModalComponent,
        MockNgxSmartModalComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockIconButtonComponent,
        MockImportExportComponent,
      ],
      imports: [RouterTestingModule, HttpClientModule, ReactiveFormsModule, NgSelectModule, FormsModule],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V2AppCentricSubjectsService)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubjectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get Filters', () => {
    jest.spyOn(component['filterService'], 'getManyFilter').mockReturnValue(of({} as any));
    component.getFilters();
    expect(component['filterService'].getManyFilter).toHaveBeenCalled();
  });

  it('should get filter table data', () => {
    component.subjectId = '1';
    jest.spyOn(component['subjectsService'], 'getOneSubject').mockReturnValue(of({} as any));
    component.getFiltertableData();
    expect(component['subjectsService'].getOneSubject).toHaveBeenCalledWith({ id: '1', relations: ['filters'] });
  });

  it('should remove filter', () => {
    component.subjectId = '1';
    const filterToRemove = { id: '123', description: 'Bye!', contractId: 'epgId-123', tenantId: 'tenantId-123' };
    component.removeFilter(filterToRemove);
    jest.spyOn(component['subjectsService'], 'getOneSubject').mockReturnValue(of({} as any));
  });

  it('should add filter', () => {
    component.subjectId = '1';
    component.selectedFilter = { id: '123', tenantId: 'tenantId-123' };
    component.addFilter();
    jest.spyOn(component['subjectsService'], 'getOneSubject').mockReturnValue(of({} as any));
  });

  it('should call to create a Subject', () => {
    const service = TestBed.inject(V2AppCentricSubjectsService);
    const createSubjectSpy = jest.spyOn(service, 'createOneSubject');

    component.modalMode = ModalMode.Create;
    component.form.setValue({
      applyBothDirections: true,
      reverseFilterPorts: true,
      globalAlias: '',
      name: 'subject1',
      alias: '',
      description: 'description!',
      serviceGraphId: null,
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(createSubjectSpy).toHaveBeenCalled();
  });

  it('should call to update a Subject', () => {
    const service = TestBed.inject(V2AppCentricSubjectsService);
    const updateSubjectSpy = jest.spyOn(service, 'updateOneSubject');

    component.modalMode = ModalMode.Edit;
    component.contractId = '123';
    component.form.setValue({
      applyBothDirections: true,
      reverseFilterPorts: true,
      globalAlias: '',
      name: 'subject',
      alias: '',
      description: 'updated description!',
      serviceGraphId: null,
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(updateSubjectSpy).toHaveBeenCalled();
  });

  it('should call ngx.close with the correct argument when cancelled', () => {
    const ngx = component['ngx'];

    const ngxSpy = jest.spyOn(ngx, 'close');

    component['closeModal']();

    expect(ngxSpy).toHaveBeenCalledWith('subjectModal');
  });

  it('should reset the form when closing the modal', () => {
    component.form.controls.description.setValue('Test');

    const cancelButton = fixture.debugElement.query(By.css('.btn.btn-link'));
    cancelButton.nativeElement.click();

    expect(component.form.controls.description.value).toBe('');
  });

  describe('importSubjectFiltersConfig', () => {
    const mockNgxSmartModalComponent = {
      getData: jest.fn().mockReturnValue({ modalYes: true }),
      removeData: jest.fn(),
      onCloseFinished: {
        subscribe: jest.fn(),
      },
    };

    beforeEach(() => {
      component['ngx'] = {
        getModal: jest.fn().mockReturnValue({
          ...mockNgxSmartModalComponent,
          open: jest.fn(),
        }),
        setModalData: jest.fn(),
      } as any;
    });

    it('should display a confirmation modal with the correct message', () => {
      const event = [{ name: 'Filter 1' }, { name: 'Filter 1' }] as any;
      const modalDto = new YesNoModalDto(
        'Import Subject Filters',
        `Are you sure you would like to import ${event.length} Subject Filters?`,
      );
      const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');

      component.importSubjectFilterRelation(event);

      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(modalDto, component['ngx'], expect.any(Function), expect.any(Function));
    });

    it('should import subject filters and refresh on confirmation', () => {
      const event = [{ name: 'Filter 1' }, { name: 'Filter 1' }] as any;
      jest.spyOn(component, 'getFiltertableData');
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onConfirm();

        expect(component['subjectsService'].addFilterToSubjectSubject).toHaveBeenCalledTimes(2);

        mockNgxSmartModalComponent.onCloseFinished.subscribe((modal: typeof mockNgxSmartModalComponent) => {
          const data = modal.getData() as YesNoModalDto;
          modal.removeData();
          if (data && data.modalYes) {
            onConfirm();
          }
        });

        return new Subscription();
      });

      component.importSubjectFilterRelation(event);

      expect(component.getFiltertableData).toHaveBeenCalled();
    });
  });
});
