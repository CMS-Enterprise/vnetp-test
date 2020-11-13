import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockComponent, MockTabsComponent } from 'src/test/mock-components';
import { SlaLandingComponent, SlaTab } from './sla-landing.component';

describe('SlaLandingComponent', () => {
  let component: SlaLandingComponent;
  let fixture: ComponentFixture<SlaLandingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        MockTabsComponent,
        SlaLandingComponent,
        MockComponent('app-profile-list'),
        MockComponent('app-template-list'),
        MockComponent('app-logical-group-list'),
      ],
    });
    fixture = TestBed.createComponent(SlaLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to select the template tab', () => {
    expect(component.activeTabName).toBe(SlaTab.Templates);
  });

  it('should update the tab and render the new component', () => {
    component.handleTabChange({ name: SlaTab.LogicalGroups });
    fixture.detectChanges();

    const templateList = fixture.debugElement.query(By.css('app-template-list'));
    const profileList = fixture.debugElement.query(By.css('app-profile-list'));
    const logicalGroupList = fixture.debugElement.query(By.css('app-logical-group-list'));
    expect(templateList).toBeNull();
    expect(profileList).toBeNull();
    expect(logicalGroupList).toBeDefined();
  });
});
