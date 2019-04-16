import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolarisDetailComponent } from './solaris-detail.component';

describe('SolarisDetailComponent', () => {
  let component: SolarisDetailComponent;
  let fixture: ComponentFixture<SolarisDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolarisDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolarisDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
