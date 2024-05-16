import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalRouteComponent } from './external-route.component';

describe('ExternalRouteComponent', () => {
  let component: ExternalRouteComponent;
  let fixture: ComponentFixture<ExternalRouteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExternalRouteComponent],
    });
    fixture = TestBed.createComponent(ExternalRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
