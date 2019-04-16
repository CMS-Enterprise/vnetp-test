import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolarisCdomViewComponent } from './solaris-cdom-view.component';

describe('SolarisCdomViewComponent', () => {
  let component: SolarisCdomViewComponent;
  let fixture: ComponentFixture<SolarisCdomViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolarisCdomViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolarisCdomViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
