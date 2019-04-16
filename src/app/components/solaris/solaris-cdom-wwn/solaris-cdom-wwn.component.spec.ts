import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolarisCdomWwnComponent } from './solaris-cdom-wwn.component';

describe('SolarisCdomWwnComponent', () => {
  let component: SolarisCdomWwnComponent;
  let fixture: ComponentFixture<SolarisCdomWwnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolarisCdomWwnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolarisCdomWwnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
