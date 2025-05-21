import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppIdMaintenanceComponent } from './app-id-maintenance.component';

describe('AppIdMaintenanceComponent', () => {
  let component: AppIdMaintenanceComponent;
  let fixture: ComponentFixture<AppIdMaintenanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppIdMaintenanceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppIdMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
