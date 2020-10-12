import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockFontAwesomeComponent } from 'src/test/mock-components';
import { By } from '@angular/platform-browser';
import { ViewFieldComponent } from './view-field.component';

describe('ViewFieldComponent', () => {
  let component: ViewFieldComponent;
  let fixture: ComponentFixture<ViewFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewFieldComponent],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ViewFieldComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the label', () => {
    component.label = 'Label';
    fixture.detectChanges();

    const label = fixture.debugElement.query(By.css('label'));
    expect(label.nativeElement.textContent).toEqual('Label');
  });

  it('should render the value', () => {
    component.value = 'Value';
    fixture.detectChanges();

    const value = fixture.debugElement.query(By.css('p'));
    expect(value.nativeElement.textContent).toEqual('Value');
  });
});
