import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicalServerDetailComponent } from './physical-server-detail.component';

describe('PhysicalServerDetailComponent', () => {
  let component: PhysicalServerDetailComponent;
  let fixture: ComponentFixture<PhysicalServerDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PhysicalServerDetailComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhysicalServerDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
