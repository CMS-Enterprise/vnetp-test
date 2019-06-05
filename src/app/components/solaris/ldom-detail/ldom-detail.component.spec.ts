import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LdomDetailComponent } from './ldom-detail.component';

describe('LdomDetailComponent', () => {
  let component: LdomDetailComponent;
  let fixture: ComponentFixture<LdomDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LdomDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LdomDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
