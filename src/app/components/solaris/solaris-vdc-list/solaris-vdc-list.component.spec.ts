import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolarisVdcListComponent } from './solaris-vdc-list.component';

describe('SolarisVdcListComponent', () => {
  let component: SolarisVdcListComponent;
  let fixture: ComponentFixture<SolarisVdcListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolarisVdcListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolarisVdcListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
