import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolarisCdomLdomsComponent } from './solaris-cdom-ldoms.component';

describe('SolarisCdomLdomsComponent', () => {
  let component: SolarisCdomLdomsComponent;
  let fixture: ComponentFixture<SolarisCdomLdomsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolarisCdomLdomsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolarisCdomLdomsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
