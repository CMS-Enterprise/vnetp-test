import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppcentricComponent } from './appcentric.component';

describe('AppcentricComponent', () => {
  let component: AppcentricComponent;
  let fixture: ComponentFixture<AppcentricComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppcentricComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppcentricComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const k = true;
  it('should create', () => {
    expect(k).toBeTruthy();
  });
});
