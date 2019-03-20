import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IpaddressesComponent } from './ipaddresses.component';

describe('IpaddressesComponent', () => {
  let component: IpaddressesComponent;
  let fixture: ComponentFixture<IpaddressesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IpaddressesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IpaddressesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
