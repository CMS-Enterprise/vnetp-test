import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockFontAwesomeComponent } from 'src/test/mock-components';
import { NgxPaginationModule } from 'ngx-pagination';
import { TableComponent } from './table.component';
import { By } from '@angular/platform-browser';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxPaginationModule],
      declarations: [TableComponent, MockFontAwesomeComponent],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(TableComponent);
        component = fixture.componentInstance;
        component.config = {
          description: 'Description',
          columns: [],
        };
        component.data = [];
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render data in HTML', () => {
    component.config.columns = [{ property: 'name', name: 'Name ' }];
    component.data = [{ name: 'Example' }];
    fixture.detectChanges();

    const el = fixture.debugElement.query(By.css('tbody td'));
    expect(el.nativeElement.textContent).toBe('Example');
  });
});
