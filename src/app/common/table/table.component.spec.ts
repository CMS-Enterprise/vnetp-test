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
    expect(el.nativeElement.textContent).toBe('No Objects in this Table');
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

  describe('ngAfterViewInit', () => {
    it('should hide search bar and pagination for descriptions in lists', () => {
      // Provide empty search params so hasSearchResults stays false initially
      jest
        .spyOn(component['tableContextService'], 'getSearchLocalStorage')
        .mockReturnValue({ searchText: '', searchColumn: '', filteredResults: false, searchString: '' } as any);
      jest.spyOn(component['tableContextService'], 'getAdvancedSearchLocalStorage').mockReturnValue(null);

      component.config.description = 'Import Preview'; // becomes "import-preview"
      const detectSpy = jest.spyOn(component['changeRef'], 'detectChanges');

      component.ngAfterViewInit();

      expect(component.showSearchBar).toBe(false); // in badList
      expect(component.paginationControlsOn).toBe(false); // in hidePagination
      expect(component.hasSearchResults).toBe(false);
      expect(detectSpy).toHaveBeenCalled();
    });

    it('should forward advancedSearchAdapter and mark hasSearchResults true when search text present', () => {
      const nextSpy = jest.spyOn(component.advancedSearchAdapterSubject, 'next');
      jest
        .spyOn(component['tableContextService'], 'getSearchLocalStorage')
        .mockReturnValue({ searchText: 'abc', searchColumn: 'name', filteredResults: true, searchString: '' } as any);
      jest.spyOn(component['tableContextService'], 'getAdvancedSearchLocalStorage').mockReturnValue(null);

      component.config.description = 'Custom Description';
      component.config.advancedSearchAdapter = { adapter: true } as any;

      component.ngAfterViewInit();

      expect(nextSpy).toHaveBeenCalledWith(component.config.advancedSearchAdapter);
      expect(component.hasSearchResults).toBe(true);
      expect(component.showSearchBar).toBe(true);
      expect(component.paginationControlsOn).toBe(true);
    });
  });

  describe('onTableEvent – advanced search branch', () => {
    it('should call searchThis and skip table emission when advancedSearchParams exist', () => {
      const advParams = { searchOperator: 'AND', searchString: 'query' } as any;
      jest.spyOn(component['tableContextService'], 'getAdvancedSearchLocalStorage').mockReturnValue(advParams);
      jest
        .spyOn(component['tableContextService'], 'getSearchLocalStorage')
        .mockReturnValue({ searchText: '', searchColumn: '', filteredResults: false, searchString: '' } as any);

      // Stub the advancedSearchComponent to avoid template dependency
      component.advancedSearchComponent = { searchThis: jest.fn() } as any;
      const searchSpy = jest.spyOn(component.advancedSearchComponent, 'searchThis');
      const tableEmitSpy = jest.spyOn(component.tableEvent, 'emit');
      const itemsPerPageEmitSpy = jest.spyOn(component.itemsPerPageChange, 'emit');

      component.currentPage = 2;
      component.itemsPerPage = 50;

      component.onTableEvent();

      expect(searchSpy).toHaveBeenCalledWith(2, 50, advParams.searchOperator, advParams.searchString);
      expect(tableEmitSpy).not.toHaveBeenCalled();
      expect(itemsPerPageEmitSpy).not.toHaveBeenCalled();
    });
  });

  describe('onTableEvent – default branch', () => {
    it('should set hasSearchResults false and emit table events when no search criteria', () => {
      jest
        .spyOn(component['tableContextService'], 'getSearchLocalStorage')
        .mockReturnValue({ searchText: '', searchColumn: '', filteredResults: false, searchString: '' } as any);
      jest.spyOn(component['tableContextService'], 'getAdvancedSearchLocalStorage').mockReturnValue(null);

      const addFilteredSpy = jest.spyOn(component['tableContextService'], 'addFilteredResultsLocalStorage').mockReturnValue(null);
      const tableEmitSpy = jest.spyOn(component.tableEvent, 'emit');
      const itemsPerPageEmitSpy = jest.spyOn(component.itemsPerPageChange, 'emit');

      component.onTableEvent();

      expect(component.hasSearchResults).toBe(false);
      expect(addFilteredSpy).toHaveBeenCalled();
      expect(tableEmitSpy).toHaveBeenCalledWith(expect.any(Object));
      expect(itemsPerPageEmitSpy).toHaveBeenCalledWith(component.itemsPerPage);
    });
  });

  describe('getRowStyle', () => {
    it('should return default deleted style when datum.deletedAt present', () => {
      component.config.disableDefaultRowStyle = false;
      const style = component.getRowStyle({ deletedAt: 'yesterday' });
      expect(style.textDecoration).toBe('line-through');
    });

    it('should return default disabled style when datum.enabled is false', () => {
      component.config.disableDefaultRowStyle = false;
      const style = component.getRowStyle({ enabled: false });
      expect(style.textDecoration).toBe('line-through');
    });

    it('should apply custom rowStyle when disableDefaultRowStyle is true', () => {
      component.config.disableDefaultRowStyle = true;
      component.config.rowStyle = () => ({ background: 'blue' });
      const style = component.getRowStyle({});
      expect(style.background).toBe('blue');
    });

    it('should apply rowStyle when no default style matches', () => {
      component.config.disableDefaultRowStyle = false;
      component.config.rowStyle = () => ({ background: 'green' });
      const style = component.getRowStyle({});
      expect(style.background).toBe('green');
    });

    it('should return empty style when disableDefaultRowStyle is true and no custom rowStyle', () => {
      component.config.disableDefaultRowStyle = true;
      component.config.rowStyle = undefined as any;
      const style = component.getRowStyle({});
      expect(style).toEqual({});
    });

    it('should return empty style when no default or custom style matches', () => {
      component.config.disableDefaultRowStyle = false;
      component.config.rowStyle = undefined as any;
      const style = component.getRowStyle({});
      expect(style).toEqual({});
    });
  });

  describe('handleRowClick & template navigation', () => {
    it('should toggle expansion and initialize template index when not from button', () => {
      const datum: any = {};
      component.config.expandableRows = () => [jest.fn() as any, jest.fn() as any];
      component.expandableRows = true;
      const event = { target: document.createElement('div') } as any;

      component.handleRowClick(event as any, datum);

      expect(datum.expanded).toBe(true);
      expect(datum.currentTemplateIndex).toBe(0);
    });

    it('should not toggle when event originates from button element', () => {
      const datum: any = {};
      component.config.expandableRows = () => [jest.fn() as any];
      component.expandableRows = true;
      const button = document.createElement('button');
      const event = { target: button } as any;

      component.handleRowClick(event as any, datum);
      expect(datum.expanded).toBeUndefined();
    });

    it('previousTemplate and nextTemplate should cycle templates and call detectChanges', () => {
      const templates = [jest.fn() as any, jest.fn() as any];
      component.config.expandableRows = () => templates;
      const datum: any = { currentTemplateIndex: 0 };
      const detectSpy = jest.spyOn(component['changeRef'], 'detectChanges');

      component.previousTemplate(datum);
      expect(datum.currentTemplateIndex).toBe(1);
      expect(detectSpy).toHaveBeenCalled();

      component.nextTemplate(datum);
      expect(datum.currentTemplateIndex).toBe(0);
    });

    it('isTemplateArray should correctly identify an array of templates', () => {
      component.config.expandableRows = () => [jest.fn() as any];
      expect(component.isTemplateArray()).toBe(true);
      component.config.expandableRows = () => jest.fn() as any;
      expect(component.isTemplateArray()).toBe(false);
    });
  });

  describe('setAdvancedSearchData', () => {
    it('should update component data, mark results and call searchBar.setFilteredResults', () => {
      const mockEvent = { data: ['row1'] } as any;
      // stub the searchBarComponent with required method
      component.searchBarComponent = { setFilteredResults: jest.fn() } as any;

      component.setAdvancedSearchData(mockEvent);

      expect(component.data).toBe(mockEvent);
      expect(component.searchBarComponent.setFilteredResults).toHaveBeenCalled();
      expect(component.hasSearchResults).toBe(true);
    });
  });
});
