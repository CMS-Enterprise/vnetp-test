import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TooltipComponent } from './tooltip.component';
import { MockFontAwesomeComponent } from 'src/test/mock-components';

describe('TooltipComponent', () => {
  let component: TooltipComponent;
  let fixture: ComponentFixture<TooltipComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TooltipComponent, MockFontAwesomeComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
