import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolarisCdomCoresComponent } from './solaris-cdom-cores.component';

describe('SolarisCdomCoresComponent', () => {
  let component: SolarisCdomCoresComponent;
  let fixture: ComponentFixture<SolarisCdomCoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolarisCdomCoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolarisCdomCoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
