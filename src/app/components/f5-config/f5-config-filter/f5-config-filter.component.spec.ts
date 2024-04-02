import { ComponentFixture, TestBed } from '@angular/core/testing';

import { F5ConfigFilterComponent } from './f5-config-filter.component';

describe('F5ConfigFilterComponent', () => {
  let component: F5ConfigFilterComponent;
  let fixture: ComponentFixture<F5ConfigFilterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [F5ConfigFilterComponent],
    });
    fixture = TestBed.createComponent(F5ConfigFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
