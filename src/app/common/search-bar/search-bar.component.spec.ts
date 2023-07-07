import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchBarComponent, SearchColumnConfig } from './search-bar.component';
import { TableContextService } from '../../services/table-context.service';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { MockFontAwesomeComponent } from 'src/test/mock-components';

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;

  const tableContextServiceMock = {
    addSearchLocalStorage: jest.fn(),
    removeSearchLocalStorage: jest.fn(),
    addFilteredResultsLocalStorage: jest.fn(),
    getSearchLocalStorage: jest.fn(() => {
      return {
        searchColumn: 'name',
        searchText: 'John',
        filteredResults: true,
      };
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchBarComponent, MockFontAwesomeComponent],
      providers: [{ provide: TableContextService, useValue: tableContextServiceMock }],
      imports: [FormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;

    component.columns = [
      { propertyName: 'name', displayName: 'Name' },
      { propertyName: 'age', displayName: 'Age' },
    ];
    component.searchColumn = '';
    component.searchText = 'John';

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('searchThis', () => {
    it('should set searchError to true when searchText is empty', () => {
      component.searchText = '';

      component.searchThis();

      expect(component.searchError).toBe(true);
    });

    it('should set searchError to true when searchColumn is empty', () => {
      component.searchColumn = '';

      component.searchThis();

      expect(component.searchError).toBe(true);
    });

    it('should call tableContextService methods and emit searchCriteria when both searchText and searchColumn are not empty', () => {
      component.searchText = 'John';
      component.searchColumn = 'name';

      const addSearchLocalStorageSpy = jest.spyOn(tableContextServiceMock, 'addSearchLocalStorage');
      const addFilteredResultsLocalStorageSpy = jest.spyOn(tableContextServiceMock, 'addFilteredResultsLocalStorage');
      const searchCriteriaEmitSpy = jest.spyOn(component.searchCriteria, 'emit');

      component.searchThis();

      expect(addSearchLocalStorageSpy).toHaveBeenCalledWith(JSON.stringify(component.searchColumn), JSON.stringify(component.searchText));
      expect(addFilteredResultsLocalStorageSpy).toHaveBeenCalled();
      expect(component.searchError).toBe(false);
      expect(component.filteredResults).toBe(true);
      expect(searchCriteriaEmitSpy).toHaveBeenCalledWith({ searchColumn: component.searchColumn, searchText: component.searchText });
    });
  });

  describe('ngOnInit', () => {
    it('should set searchColumn to defaultSearch.propertyName when previousSearchColumn is not present', () => {
      tableContextServiceMock.getSearchLocalStorage = jest.fn(() => {
        return {
          searchColumn: undefined,
          searchText: 'John',
          filteredResults: true,
        };
      });

      const testComponent = new SearchBarComponent(tableContextServiceMock as any);
      testComponent.columns = [
        { propertyName: 'name', displayName: 'Name' },
        { propertyName: 'age', displayName: 'Age' },
      ];
      testComponent.searchColumn = '';
      testComponent.searchText = 'John';

      testComponent.ngOnInit();

      expect(testComponent.searchColumn).toBe(testComponent.defaultSearch.propertyName);
    });

    it('should set filteredResults when previous filteredResults is true', () => {
      tableContextServiceMock.getSearchLocalStorage = jest.fn(() => {
        return {
          searchColumn: 'name',
          searchText: 'John',
          filteredResults: true,
        };
      });

      const testComponent = new SearchBarComponent(tableContextServiceMock as any);
      testComponent.columns = [
        { propertyName: 'name', displayName: 'Name' },
        { propertyName: 'age', displayName: 'Age' },
      ];
      testComponent.searchColumn = '';
      testComponent.searchText = 'John';

      testComponent.ngOnInit();

      expect(testComponent.filteredResults).toBe(true);
    });
  });

  describe('clearFilteredResults', () => {
    it('should call removeSearchLocalStorage, set filteredResults and searchError to false, and emit searchBarClearResults', () => {
      const removeSearchLocalStorageSpy = jest.spyOn(tableContextServiceMock, 'removeSearchLocalStorage');
      const searchBarClearResultsEmitSpy = jest.spyOn(component.searchBarClearResults, 'emit');

      component.filteredResults = true;
      component.searchError = true;

      component.clearFilteredResults();

      expect(removeSearchLocalStorageSpy).toHaveBeenCalled();
      expect(component.filteredResults).toBe(false);
      expect(component.searchError).toBe(false);
      expect(searchBarClearResultsEmitSpy).toHaveBeenCalled();
    });
  });
});
