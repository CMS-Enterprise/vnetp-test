import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolarisLdomListComponent } from './solaris-ldom-list.component';

describe('SolarisLdomListComponent', () => {
  let component: SolarisLdomListComponent;
  let fixture: ComponentFixture<SolarisLdomListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolarisLdomListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolarisLdomListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
