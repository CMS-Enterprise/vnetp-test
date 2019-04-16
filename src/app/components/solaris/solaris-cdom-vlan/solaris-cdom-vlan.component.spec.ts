import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolarisCdomVlanComponent } from './solaris-cdom-vlan.component';

describe('SolarisCdomVlanComponent', () => {
  let component: SolarisCdomVlanComponent;
  let fixture: ComponentFixture<SolarisCdomVlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolarisCdomVlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolarisCdomVlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
