import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplianceDetailComponent } from './appliance-detail.component';

describe('ApplianceDetailComponent', () => {
  let component: ApplianceDetailComponent;
  let fixture: ComponentFixture<ApplianceDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApplianceDetailComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplianceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
