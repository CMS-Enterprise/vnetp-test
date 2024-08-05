import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteTableModalComponent } from './route-table-modal.component';

describe('RouteTableModalComponent', () => {
  let component: RouteTableModalComponent;
  let fixture: ComponentFixture<RouteTableModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteTableModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RouteTableModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
