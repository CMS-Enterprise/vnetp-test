import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockTooltipComponent } from 'src/test/mock-components';
import { By } from '@angular/platform-browser';
import { TabsComponent } from './tabs.component';

describe('TabsComponent', () => {
  let component: TabsComponent;
  let fixture: ComponentFixture<TabsComponent>;

  beforeEach(() => {
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
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit an event when the tab changes', () => {
    const eventSpy = jest.spyOn(component.tabChange, 'emit');

    const [tab1] = fixture.debugElement.queryAll(By.css('.nav-item'));
    tab1.nativeElement.click();
    expect(eventSpy).toHaveBeenCalledWith({ name: '1' });
  });

  it('should display sub-tabs when parent tab has them', () => {
    // Set up tabs with sub-tabs
    component.tabs = [
      {
        name: 'Parent1',
        subTabs: [{ name: 'Child1' }, { name: 'Child2' }],
      },
      { name: 'Parent2' },
    ];

    // Select the first tab with sub-tabs
    component.setActiveTab(component.tabs[0]);
    fixture.detectChanges();

    // Verify sub-tabs are displayed
    const subTabs = fixture.debugElement.queryAll(By.css('.sub-tabs .nav-item'));
    expect(subTabs.length).toBe(2);
    expect(subTabs[0].nativeElement.textContent).toContain('Child1');
    expect(subTabs[1].nativeElement.textContent).toContain('Child2');
  });

  it('should select first sub-tab by default', () => {
    // Set up tabs with sub-tabs
    component.tabs = [
      {
        name: 'Parent1',
        subTabs: [{ name: 'Child1' }, { name: 'Child2' }],
      },
    ];

    // Select the parent tab
    component.setActiveTab(component.tabs[0]);
    fixture.detectChanges();

    // Verify the first sub-tab is active by default
    expect(component.activeSubTab.name).toBe('Child1');
    const activeSubTab = fixture.debugElement.query(By.css('.sub-tabs .nav-item .nav-link.active'));
    expect(activeSubTab.nativeElement.textContent).toContain('Child1');
  });

  it('should emit event when sub-tab is selected', () => {
    // Set up tabs with sub-tabs
    component.tabs = [
      {
        name: 'Parent1',
        subTabs: [{ name: 'Child1' }, { name: 'Child2' }],
      },
    ];

    // Select the parent tab first
    component.setActiveTab(component.tabs[0]);
    fixture.detectChanges();

    // Spy on the event emitter
    const eventSpy = jest.spyOn(component.tabChange, 'emit');

    // Click on the second sub-tab
    const subTabs = fixture.debugElement.queryAll(By.css('.sub-tabs .nav-item'));
    subTabs[1].nativeElement.click();

    // Verify the event was emitted with the correct sub-tab
    expect(eventSpy).toHaveBeenCalledWith({ name: 'Child2' });
    expect(component.activeSubTab.name).toBe('Child2');
  });
});
