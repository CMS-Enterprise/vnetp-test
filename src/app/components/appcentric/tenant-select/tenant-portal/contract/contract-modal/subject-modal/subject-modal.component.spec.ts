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
import { Subscription } from 'rxjs';
import { Filter, V2AppCentricSubjectsService } from 'client';

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

  // it('should remove filter', () => {
  //   const filterToDelete = { id: '123', description: 'Bye!', subjectId: 'epgId-123', tenantId: 'tenantId-123' } as Filter;
  //   component.removeFilter(filterToDelete);
  //   const getFiltersMock = jest.spyOn(component['filterService'], 'getManyFilter');
  //   expect(getFiltersMock).toHaveBeenCalled();
  // });

  it('should add filter', () => {
    component.selectedFilter = { id: '123', tenantId: 'tenantId-123' };
    component.addFilter();
    const getProvidedFiltersMock = jest.spyOn(component['filterService'], 'getManyFilter');
    // expect(getProvidedFiltersMock).toHaveBeenCalled();
  });
});
