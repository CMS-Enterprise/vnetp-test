import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActifioDetailedLogicalGroupDto } from 'api_client';
import { MockComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { LogicalGroupViewModalComponent } from './logical-group-view-modal.component';

describe('LogicalGroupViewModalComponent', () => {
  let component: LogicalGroupViewModalComponent;
  let fixture: ComponentFixture<LogicalGroupViewModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        MockNgxSmartModalComponent,
        LogicalGroupViewModalComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data'] }),
      ],
    });
    fixture = TestBed.createComponent(LogicalGroupViewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the title of the Logical Group', () => {
    component.logicalGroup = {
      logicalGroup: {
        id: '1',
        name: 'Logical Group #1',
      },
      members: [],
    } as ActifioDetailedLogicalGroupDto;
    fixture.detectChanges();

    const title = fixture.debugElement.query(By.css('.modal-title'));
    expect(title.nativeElement.textContent).toBe('Logical Group #1');
  });
});
