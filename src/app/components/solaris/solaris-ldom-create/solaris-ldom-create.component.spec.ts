import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolarisLdomCreateComponent } from './solaris-ldom-create.component';

describe('SolarisLdomCreateComponent', () => {
  let component: SolarisLdomCreateComponent;
  let fixture: ComponentFixture<SolarisLdomCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SolarisLdomCreateComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolarisLdomCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
