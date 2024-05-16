import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalRouteModalComponent } from './external-route-modal.component';

describe('ExternalRouteModalComponent', () => {
  let component: ExternalRouteModalComponent;
  let fixture: ComponentFixture<ExternalRouteModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExternalRouteModalComponent],
    });
    fixture = TestBed.createComponent(ExternalRouteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
