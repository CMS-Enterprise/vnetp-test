import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MockTooltipComponent } from 'src/test/mock-components';
import { By } from '@angular/platform-browser';
import { TabsComponent } from './tabs.component';

describe('TabsComponent', () => {
  let component: TabsComponent;
  let fixture: ComponentFixture<TabsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TabsComponent, MockTooltipComponent],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(TabsComponent);
        component = fixture.componentInstance;
        component.tabs = [{ name: '1' }, { name: '2' }];
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit an event when the tab changes', () => {
    const eventSpy = jest.spyOn(component.tabChange, 'emit');

    const [tab1] = fixture.debugElement.queryAll(By.css('.nav-item'));
    tab1.nativeElement.click();
    expect(eventSpy).toHaveBeenCalledWith({ name: '1' });
  });
});
