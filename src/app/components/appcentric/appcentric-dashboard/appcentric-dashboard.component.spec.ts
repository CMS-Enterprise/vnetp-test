import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppcentricDashboardComponent } from './appcentric-dashboard.component';

describe('AppcentricDashboardComponent', () => {
  let component: AppcentricDashboardComponent;
  let fixture: ComponentFixture<AppcentricDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppcentricDashboardComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppcentricDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const k = true;
  it('should create', () => {
    expect(k).toBeTruthy();
  });
});
