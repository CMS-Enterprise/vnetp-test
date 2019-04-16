import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolarisLdomEditComponent } from './solaris-ldom-edit.component';

describe('SolarisLdomEditComponent', () => {
  let component: SolarisLdomEditComponent;
  let fixture: ComponentFixture<SolarisLdomEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolarisLdomEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolarisLdomEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
