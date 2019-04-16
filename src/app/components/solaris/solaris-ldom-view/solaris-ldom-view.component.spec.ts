import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolarisLdomViewComponent } from './solaris-ldom-view.component';

describe('SolarisLdomViewComponent', () => {
  let component: SolarisLdomViewComponent;
  let fixture: ComponentFixture<SolarisLdomViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolarisLdomViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolarisLdomViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
