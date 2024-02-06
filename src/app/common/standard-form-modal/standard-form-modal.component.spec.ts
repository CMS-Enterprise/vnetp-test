import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StandardFormModalComponent } from './standard-form-modal.component';

describe('StandardFormModalComponent', () => {
  let component: StandardFormModalComponent;
  let fixture: ComponentFixture<StandardFormModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StandardFormModalComponent],
    });
    fixture = TestBed.createComponent(StandardFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
