import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplianceModalComponent } from './appliance-modal.component';

describe('ApplianceModalComponent', () => {
  let component: ApplianceModalComponent;
  let fixture: ComponentFixture<ApplianceModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApplianceModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplianceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
