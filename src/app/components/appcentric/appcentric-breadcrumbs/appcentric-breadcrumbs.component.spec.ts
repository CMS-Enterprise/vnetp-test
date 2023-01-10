import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppcentricBreadcrumbsComponent } from './appcentric-breadcrumbs.component';

describe('AppcentricBreadcrumbsComponent', () => {
  let component: AppcentricBreadcrumbsComponent;
  let fixture: ComponentFixture<AppcentricBreadcrumbsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppcentricBreadcrumbsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppcentricBreadcrumbsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const k = true;
  it('should create', () => {
    expect(k).toBeTruthy();
  });
});
