import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent, MockTooltipComponent } from 'src/test/mock-components';
import { NgxPaginationModule } from 'ngx-pagination';
import { TableComponent } from './table.component';
import { By } from '@angular/platform-browser';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockProvider } from 'src/test/mock-providers';
import { AdvancedSearchModule } from '../advanced-search/advanced-search-modal.module';
import { AdvancedSearchComponent } from '../advanced-search/advanced-search-modal.component';

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
        MockComponent({ selector: 'app-advanced-search-modal', inputs: ['objectType', 'formInputs'] }),
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
});
