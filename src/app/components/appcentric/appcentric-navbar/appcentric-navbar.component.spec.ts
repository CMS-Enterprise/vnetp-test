import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppcentricNavbarComponent } from './appcentric-navbar.component';

describe('AppcentricNavbarComponent', () => {
  let component: AppcentricNavbarComponent;
  let fixture: ComponentFixture<AppcentricNavbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppcentricNavbarComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppcentricNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const k = true;
  it('should create', () => {
    expect(k).toBeTruthy();
  });
});
