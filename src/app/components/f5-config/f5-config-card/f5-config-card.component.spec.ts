import { ComponentFixture, TestBed } from '@angular/core/testing';

import { F5ConfigCardComponent } from './f5-config-card.component';

describe('F5ConfigCardComponent', () => {
  let component: F5ConfigCardComponent;
  let fixture: ComponentFixture<F5ConfigCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [F5ConfigCardComponent],
    });
    fixture = TestBed.createComponent(F5ConfigCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
