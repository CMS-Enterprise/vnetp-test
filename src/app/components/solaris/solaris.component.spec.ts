import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolarisComponent } from './solaris.component';

describe('SolarisComponent', () => {
  let component: SolarisComponent;
  let fixture: ComponentFixture<SolarisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolarisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolarisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
