import { ComponentFixture, TestBed } from '@angular/core/testing';

import { F5ConfigComponent } from './f5-config.component';

describe('F5ConfigComponent', () => {
  let component: F5ConfigComponent;
  let fixture: ComponentFixture<F5ConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [F5ConfigComponent],
    });
    fixture = TestBed.createComponent(F5ConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
