/* eslint-disable */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockImportExportComponent,
  MockNgxSmartModalComponent,
  MockYesNoModalComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { FilterComponent } from './filter.component';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { of, Subject, Subscription } from 'rxjs';
import { Filter, V2AppCentricFiltersService } from 'client';
import { FilterModalDto } from 'src/app/models/appcentric/filter-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';

describe('FilterComponent', () => {
  let component: FilterComponent;
  let fixture: ComponentFixture<FilterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        FilterComponent,
        MockNgxSmartModalComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockImportExportComponent,
        MockIconButtonComponent,
        MockYesNoModalComponent,
        MockComponent({ selector: 'app-filter-entry-modal', inputs: ['tenantId'] }),
        MockComponent({ selector: 'app-filter-modal', inputs: ['tenantId'] }),
      ],
      imports: [RouterTestingModule, HttpClientModule],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V2AppCentricFiltersService)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('importFiltersConfig', () => {
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
      const event = [{ name: 'Filter 1' }, { name: 'v 2' }] as any;
      const modalDto = new YesNoModalDto('Import Filters', `Are you sure you would like to import ${event.length} Filters?`);
      const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');

      component.importFilters(event);

      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(modalDto, component['ngx'], expect.any(Function), expect.any(Function));
    });

    it('should import filters and refresh the table on confirmation', () => {
      const event = [{ name: 'Filter 1' }, { name: 'Filter 2' }] as any;
      jest.spyOn(component, 'getFilters');
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onConfirm();

        expect(component['filterService'].createManyFilter).toHaveBeenCalledWith({
          createManyFilterDto: { bulk: component.sanitizeData(event) },
        });

        mockNgxSmartModalComponent.onCloseFinished.subscribe((modal: typeof mockNgxSmartModalComponent) => {
          const data = modal.getData() as YesNoModalDto;
          modal.removeData();
          if (data && data.modalYes) {
            onConfirm();
          }
        });

        return new Subscription();
      });

      component.importFilters(event);

      expect(component.getFilters).toHaveBeenCalled();
    });
  });

  it('should delete filter', () => {
    const filterToDelete = { id: '123', name: 'Test Filter', description: 'Bye!' } as any;
    const subscribeToYesNoModalSpy = jest
      .spyOn(SubscriptionUtil, 'subscribeToYesNoModal')
      .mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        // Just call onConfirm immediately for testing
        onConfirm();
        return new Subscription();
      });
    jest.spyOn(component['filterService'], 'softDeleteOneFilter').mockReturnValue(of({} as any));
    jest.spyOn(component as any, 'refreshFilters');

    component.deleteFilter(filterToDelete);

    expect(subscribeToYesNoModalSpy).toHaveBeenCalled();
    expect(component['filterService'].softDeleteOneFilter).toHaveBeenCalledWith({ id: '123' });
  });

  it('should restore filter', () => {
    const filter = { id: '1', name: 'Test Filter', deletedAt: true } as any;
    const subscribeToYesNoModalSpy = jest
      .spyOn(SubscriptionUtil, 'subscribeToYesNoModal')
      .mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        // Just call onConfirm immediately for testing
        onConfirm();
        return new Subscription();
      });
    jest.spyOn(component['filterService'], 'restoreOneFilter').mockReturnValue(of({} as any));
    jest.spyOn(component as any, 'refreshFilters');

    component.restoreFilter(filter);

    expect(subscribeToYesNoModalSpy).toHaveBeenCalled();
    expect(component['filterService'].restoreOneFilter).toHaveBeenCalledWith({ id: '1' });
  });

  it('should apply search params when filtered results is true', () => {
    const getFiltersMock = jest.spyOn(component, 'getFilters');
    const params = { searchString: '', filteredResults: true, searchColumn: 'name', searchText: 'test' };
    jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

    // Test refreshFilters helper method
    component['refreshFilters']();

    expect(getFiltersMock).toHaveBeenCalledWith(params);
  });

  describe('openFilterModal', () => {
    describe('openModal', () => {
      beforeEach(() => {
        jest.spyOn(component, 'getFilters');
        jest.spyOn(component['ngx'], 'resetModalData');
      });

      it('should subscribe to filterModal onCloseFinished event and unsubscribe afterwards', () => {
        const onCloseFinished = new Subject<void>();
        const mockModal = { onCloseFinished, open: jest.fn() };
        jest.spyOn(component['ngx'], 'getModal').mockReturnValue(mockModal as any);

        const unsubscribeSpy = jest.spyOn(Subscription.prototype, 'unsubscribe');

        component.subscribeToFilterModal();

        expect(component['ngx'].getModal).toHaveBeenCalledWith('filterModal');
        expect(component.filterModalSubscription).toBeDefined();

        onCloseFinished.next();

        expect(component.getFilters).toHaveBeenCalled();
        expect(component['ngx'].resetModalData).toHaveBeenCalledWith('filterModal');

        expect(unsubscribeSpy).toHaveBeenCalled();
      });
      it('should call ngx.setModalData and ngx.getModal().open', () => {
        const filter = { id: 1, name: 'Test App Profile' } as any;
        component.tenantId = { id: '1' } as any;
        component.openFilterModal(ModalMode.Edit, filter);

        expect(component['ngx'].setModalData).toHaveBeenCalledWith(expect.any(FilterModalDto), 'filterModal');
        expect(component['ngx'].getModal).toHaveBeenCalledWith('filterModal');

        const modal = component['ngx'].getModal('filterModal');
        expect(modal).toBeDefined();
      });
    });
  });
});
