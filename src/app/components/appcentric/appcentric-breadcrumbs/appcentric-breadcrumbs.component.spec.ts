import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { AppcentricBreadcrumbsComponent } from './appcentric-breadcrumbs.component';

describe('AppcentricBreadcrumbsComponent', () => {
  let component: AppcentricBreadcrumbsComponent;
  let fixture: ComponentFixture<AppcentricBreadcrumbsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppcentricBreadcrumbsComponent],
      imports: [RouterTestingModule.withRoutes([]), RouterModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppcentricBreadcrumbsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
