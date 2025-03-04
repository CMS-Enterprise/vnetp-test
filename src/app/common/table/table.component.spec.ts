/* eslint-disable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent, MockTooltipComponent } from 'src/test/mock-components';
import { NgxPaginationModule } from 'ngx-pagination';
import { TableComponent } from './table.component';
import { By } from '@angular/platform-browser';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockProvider } from 'src/test/mock-providers';
import { AdvancedSearchComponent } from '../advanced-search/advanced-search-modal.component';
import { Subject, Subscription } from 'rxjs';

interface Data {
  name: string;
}

describe('TableComponent', () => {
  let component: TableComponent<Data>;
  let fixture: ComponentFixture<TableComponent<Data>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxPaginationModule, RouterTestingModule.withRoutes([])],
      declarations: [
        TableComponent,
        MockTooltipComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-search-bar', inputs: ['columns'] }),
        MockComponent({ selector: 'app-advanced-search-modal', inputs: ['objectType', 'formInputs', 'advancedSearchAdapterSubject'] }),
        MockNgxSmartModalComponent,
      ],
      providers: [AdvancedSearchComponent, SearchBarComponent, MockProvider(NgxSmartModalService)],
    });

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    component.config = {
      description: 'Description',
      columns: [],
    };
    component.data = { data: [], count: 0, total: 0, page: 0, pageCount: 0 };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render data in HTML', () => {
    component.config.columns = [{ property: 'name', name: 'Name' }];
    component.searchColumns = [{ propertyName: 'example-prop', displayName: 'exampleProp' }];
    component.data = { data: [], count: 0, total: 0, page: 0, pageCount: 0 };
    fixture.detectChanges();

    const el = fixture.debugElement.query(By.css('tbody td'));
    expect(el.nativeElement.textContent).toBe('No Objects in this Tier');
  });

  it('should register user search parameters', () => {
    const getObjectsAndFilterSpy = jest.spyOn(component, 'getObjectsAndFilter');
    const params = { searchString: '', filteredResults: true, searchColumn: 'name', searchText: 'test' };

    component.getObjectsAndFilter(params);
    expect(getObjectsAndFilterSpy).toHaveBeenCalled();
  });

  it('should clear table results', () => {
    const clearTableResultsSpy = jest.spyOn(component, 'clearTableResults');
    component.clearTableResults();
    expect(clearTableResultsSpy).toHaveBeenCalled();
    expect(component.itemsPerPage).toEqual(20);
    expect(component.currentPage).toEqual(1);
  });

  describe('open Advanced Search Modal', () => {
    describe('openModal', () => {
      beforeEach(() => {
        jest.spyOn(component['ngx'], 'resetModalData');
      });

      it('should subscribe to advancedSearchModal onCloseFinished event and unsubscribe afterwards', () => {
        const onCloseFinished = new Subject<void>();
        const mockModal = { onCloseFinished, open: jest.fn() };
        jest.spyOn(component['ngx'], 'getModal').mockReturnValue(mockModal as any);

        const unsubscribeSpy = jest.spyOn(Subscription.prototype, 'unsubscribe');

        component.subscribeToAdvancedSearch();

        expect(component['ngx'].getModal).toHaveBeenCalledWith('advancedSearch');
        expect(component.advancedSearchSubscription).toBeDefined();

        onCloseFinished.next();

        expect(component['ngx'].resetModalData).toHaveBeenCalledWith('advancedSearch');

        expect(unsubscribeSpy).toHaveBeenCalled();
      });
      it('should call ngx.setModalData and ngx.getModal().open', () => {
        component.openAdvancedSearch();

        expect(component['ngx'].getModal).toHaveBeenCalledWith('advancedSearch');

        const modal = component['ngx'].getModal('advancedSearch');
        expect(modal).toBeDefined();
      });
    });
  });

  it('should mimic a user interacting with the pagination controls', () => {
    const basicSearchParamsSpy = { searchString: '', filteredResults: true, searchColumn: 'name', searchText: 'test' };
    // const advancedSearchParamsSpy = { searchString: '', searchOperator: 'OR' };
    const getSearchLocalStorageSpy = jest
      .spyOn(component['tableContextService'], 'getSearchLocalStorage')
      .mockReturnValue(basicSearchParamsSpy);
    const getAdvancedSearchLocalStorageSpy = jest
      .spyOn(component['tableContextService'], 'getAdvancedSearchLocalStorage')
      .mockReturnValue(null);

    const addFilteredResultsLocalStorageSpy = jest
      .spyOn(component['tableContextService'], 'addFilteredResultsLocalStorage')
      .mockReturnValue(null);

    component.onTableEvent();
    expect(getSearchLocalStorageSpy).toHaveBeenCalled();
    expect(getAdvancedSearchLocalStorageSpy).toHaveBeenCalled();
    expect(addFilteredResultsLocalStorageSpy).toHaveBeenCalled();
  });
});
